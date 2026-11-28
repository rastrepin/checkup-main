#!/usr/bin/env python3
"""Порівняння прайсу клініки з тим, що зараз на сайті і в базі.

Бере прайс у єдиному форматі (вихід intake.py), конфіг клініки зі словником
відповідностей, знімок бази і (необов'язково) попередній прайс. Пише:

  report.xlsx       таблиця «було → стало» для людини (вкладки нижче)
  db-update.csv     рядки для scripts/prices/sync-prices.mjs (запис у базу після погодження)
  tilda-manual.csv  що поставити вручну в Tilda
  plan.json         те саме для машини

    python3 scripts/prices/compare.py --config scripts/prices/clinics/onclinic-cherkasy.json \
        --intake intake.csv --db-json db.json [--previous попередній-intake.csv] \
        --valid-from 2026-11-03 --out-dir вихід/

Скрипт нічого не змінює ні в базі, ні на сайті. Рядки, що потребують рішення
(позиції немає в прайсі, зміна понад max_change_pct, ціна не число), ніколи не
потрапляють у db-update.csv і tilda-manual.csv.
"""
import argparse
import csv
import difflib
import json
import os
import sys

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill

YELLOW = PatternFill('solid', fgColor='FFF2CC')
RED = PatternFill('solid', fgColor='F4CCCC')
BOLD = Font(bold=True)


def num(v):
    try:
        return float(v) if v not in ('', None) else None
    except ValueError:
        return None


def load_intake(path):
    rows = list(csv.DictReader(open(path, encoding='utf-8')))
    items = {}
    for r in rows:
        r['price'] = num(r['price'])
        r['price_full'] = num(r['price_full'])
        if r['key'] not in items:  # повтор позиції — перший рядок
            items[r['key']] = r
    return rows, items


def rnd(x):
    """Округлення до гривні як у таблиці (половина — вгору)."""
    return None if x is None else int(x + 0.5)


def pct(old, new):
    if old in (None, 0) or new is None:
        return None
    return round((new - old) / old * 100, 1)


def suggest(key, items, n=3):
    """Найближчі назви в прайсі для позиції, якої в ньому немає (могли перейменувати)."""
    names = list(items.keys())
    return difflib.get_close_matches(key, names, n=n, cutoff=0.6)


class Plan:
    def __init__(self, cfg, items, valid_from):
        self.cfg, self.items, self.valid_from = cfg, items, valid_from
        self.max_pct = cfg.get('max_change_pct', 20)
        self.doctors, self.checkups, self.db, self.age, self.held = [], [], [], [], []
        self.price_changes, self.new_items, self.gone_items = [], [], []

    def item(self, key, where):
        it = self.items.get(key)
        if it is None:
            self.held.append({'where': where, 'reason': f'позиції «{key}» немає в прайсі',
                              'suggest': suggest(key, self.items)})
            return None
        if it['price'] is None:
            self.held.append({'where': where, 'reason': f'у прайсі ціна не число: «{it["price_raw"]}»', 'suggest': []})
            return None
        return it

    def check_jump(self, where, old, new):
        p = pct(old, new)
        if p is not None and abs(p) > self.max_pct:
            self.held.append({'where': where, 'reason': f'зміна {p}% (поріг {self.max_pct}%): {old} → {new}', 'suggest': []})
            return False
        return True

    def build(self, db, previous):
        t = self.cfg['targets']
        for d in t.get('tilda_doctors', []):
            where = f'Лікар {d["doctor"]} ({d["sku"]})'
            it = self.item(d['item'], where)
            row = {**d, 'clinic_name': it['name'] if it else '', 'clinic_price': rnd(it['price']) if it else None,
                   'marked': it['marked'] if it else '', 'row': it['row'] if it else ''}
            if it:
                row['new_site_price'] = row['clinic_price']
                row['diff'] = row['new_site_price'] - d['site_price']
                row['ok'] = self.check_jump(where, d['site_price'], row['new_site_price'])
            self.doctors.append(row)

        for c in t.get('tilda_checkups', []):
            where = f'Чекап {c["label"]} ({c["sku"]})'
            it = self.item(c['item'], where)
            row = {**c, 'clinic_name': it['name'] if it else ''}
            if it:
                row['new_site_price'] = rnd(it['price'])
                row['new_site_old_price'] = rnd(it['price_full'])
                row['diff'] = row['new_site_price'] - c['site_price']
                row['ok'] = self.check_jump(where, c['site_price'], row['new_site_price'])
            self.checkups.append(row)

        progs = {p['slug']: p for p in db.get('programs', [])}
        for p in t.get('db_programs', []):
            where = f'База: програма {p["slug"]}'
            cur = progs.get(p['slug'])
            if cur is None:
                self.held.append({'where': where, 'reason': 'програми з таким slug немає в базі', 'suggest': []})
                continue
            it = self.item(p['item'], where)
            row = {'slug': p['slug'], 'name': cur['name_ua'], 'db_price': cur['price_discount'],
                   'db_price_regular': cur['price_regular'], 'db_date': cur.get('price_date')}
            if it:
                row['new_price'] = rnd(it['price'])
                row['new_price_regular'] = rnd(it['price_full'])
                row['same'] = row['new_price'] == cur['price_discount'] and row['new_price_regular'] == cur['price_regular']
                row['ok'] = self.check_jump(where, cur['price_discount'], row['new_price'])
            self.db.append(row)

        ap = t.get('age_programs')
        if ap:
            comps = {}
            for cid, c in ap['components'].items():
                it = self.item(c['item'], f'Складова програм «{cid}»')
                comps[cid] = {**c, 'now': rnd(it['price']) if it else None}
            for pr in ap['programs']:
                where = f'Програма {pr["label"]}'
                parts, delta, missing = [], 0, []
                for cid in pr['components']:
                    c = comps[cid]
                    if c['now'] is None:
                        missing.append(cid)
                        continue
                    d = c['now'] - c['price_in_program']
                    if d:
                        parts.append(f'{c.get("label", cid)} {c["price_in_program"]}→{c["now"]} ({d:+d})')
                    delta += d
                row = {**pr, 'delta': delta, 'parts': '; '.join(parts) or 'без змін'}
                if missing:
                    self.held.append({'where': where, 'reason': 'немає ціни складових: ' + ', '.join(comps[m].get('label', m) for m in missing), 'suggest': []})
                else:
                    row['new_site_price'] = pr['site_price'] + delta
                    row['ok'] = self.check_jump(where, pr['site_price'], row['new_site_price'])
                self.age.append(row)

        # Зміни в прайсі порівняно з попереднім прийманням
        if previous is not None:
            prev_rows, prev = previous
            partial = any(r.get('note', '').startswith('частковий знімок') for r in prev_rows)
            for k, it in self.items.items():
                p = prev.get(k)
                if p is None:
                    if not partial:
                        self.new_items.append(it)
                    continue
                if p['price'] != it['price']:
                    self.price_changes.append({'key': k, 'section': it['section'], 'name': it['name'], 'kind': it['kind'],
                                               'old': p['price'], 'new': it['price'], 'pct': pct(p['price'], it['price']),
                                               'marked': it['marked']})
            for k, p in prev.items():
                if k not in self.items:
                    self.gone_items.append({**p, 'suggest': suggest(k, self.items)})
            self.previous_partial = partial
        mapped = {d['item'] for d in t.get('tilda_doctors', [])} | {c['item'] for c in t.get('tilda_checkups', [])}
        mapped |= {p['item'] for p in t.get('db_programs', [])} | set(t.get('unmapped_ok', []))
        self.unmapped_checkups = [it for k, it in self.items.items() if it['kind'] == 'checkup' and k not in mapped]
        return self

    def as_dict(self):
        return {k: getattr(self, k) for k in ('doctors', 'checkups', 'db', 'age', 'held', 'price_changes',
                                               'new_items', 'gone_items', 'unmapped_checkups')}


def sheet(wb, title, header, rows, widths=None, highlight=None):
    ws = wb.create_sheet(title)
    ws.append(header)
    for c in ws[1]:
        c.font = BOLD
        c.alignment = Alignment(wrap_text=True, vertical='top')
    for r in rows:
        ws.append(r)
        if highlight:
            fill = highlight(r)
            if fill:
                for c in ws[ws.max_row]:
                    c.fill = fill
    for i, w in enumerate(widths or [], start=1):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = w
    ws.freeze_panes = 'A2'
    return ws


def write_report(plan, cfg, out_dir, meta):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Зведення'
    changed = lambda rows, f='diff': sum(1 for r in rows if r.get(f))
    lines = [
        f'{cfg["clinic_name"]}: оновлення цін, {meta["valid_from"]}',
        '',
        f'Прайс послуг: {meta["sources"]}',
        f'Порівняно з: {meta["previous"]}',
        f'База: знімок {meta["db_snapshot"]}',
        '',
        f'Лікарі на сайті: {len(plan.doctors)}, ціна зміниться в {changed(plan.doctors)}',
        f'Чекапи на сайті: {len(plan.checkups)}, ціна зміниться в {changed(plan.checkups)}',
        f'Чекапи в базі: {len(plan.db)}, зміниться {sum(1 for r in plan.db if r.get("same") is False)}',
        f'Програми за віком (Tilda ST310N): {len(plan.age)}, зміниться {sum(1 for r in plan.age if r.get("delta"))}',
        f'Ціни, що змінились у прайсі з минулого разу: {len(plan.price_changes)}',
        f'Позиції, що зникли з прайсу: {len(plan.gone_items)}',
        f'Чекапи клініки без картки на сайті і в базі: {len(plan.unmapped_checkups)}',
        f'Потребує рішення: {len(plan.held)}',
        '',
        'Нічого в базі і в Tilda не змінено. Запис у базу — db-update.csv через sync-prices.mjs після погодження; Tilda — tilda-manual.csv вручну.',
    ]
    for l in lines:
        ws.append([l])
    ws['A1'].font = Font(bold=True, size=13)
    ws.column_dimensions['A'].width = 120

    hl = lambda r: YELLOW if (isinstance(r[-2], (int, float)) and r[-2]) else None
    sheet(wb, 'Лікарі', ['Лікар', 'Спеціальність', 'SKU Tilda', 'Послуга в прайсі', 'Рядок прайсу', 'Позначка в прайсі',
                         'На сайті (перевірено)', 'Ціна клініки', 'Нова ціна на сайт', 'Різниця', 'Питання'],
          [[d['doctor'], d['specialty'], d['sku'], d['clinic_name'], d['row'], d['marked'],
            f'{d["site_price"]} ({d["site_checked"]})', d.get('clinic_price'),
            d.get('new_site_price'), d.get('diff'), d.get('open_question', '')] for d in plan.doctors],
          [30, 18, 20, 45, 8, 10, 18, 12, 14, 10, 60],
          highlight=lambda r: YELLOW if r[9] else None)
    sheet(wb, 'Чекапи', ['Чекап', 'SKU Tilda', 'Назва в прайсі', 'Ціна на сайті', 'Стара ціна на сайті',
                         'Нова ціна (з вигодою, округлено)', 'Нова стара ціна (повна)', 'Різниця'],
          [[c['label'], c['sku'], c['clinic_name'], c['site_price'], c['site_old_price'],
            c.get('new_site_price'), c.get('new_site_old_price'), c.get('diff')] for c in plan.checkups]
          + [[it['name'], '— немає на сайті і в базі —', it['name'], None, None, rnd(it['price']), rnd(it['price_full']), None]
             for it in plan.unmapped_checkups],
          [32, 18, 40, 12, 14, 18, 18, 10], highlight=lambda r: YELLOW if r[7] else None)
    sheet(wb, 'База', ['slug', 'Програма', 'Ціна в базі', 'Закреслена в базі', 'Дата ціни в базі',
                       'Нова ціна', 'Нова закреслена', 'Без змін'],
          [[r['slug'], r['name'], r['db_price'], r['db_price_regular'], r['db_date'], r.get('new_price'),
            r.get('new_price_regular'), 'так' if r.get('same') else 'ні'] for r in plan.db],
          [22, 34, 12, 14, 14, 12, 14, 10], highlight=lambda r: YELLOW if r[7] == 'ні' else None)
    sheet(wb, 'Програми за віком', ['Сторінка', 'Програма', 'На сайті (перевірено)', 'Що подорожчало в складі', 'Різниця', 'Нова ціна на сайт'],
          [[a['page'], a['label'], f'{a["site_price"]} ({a["site_checked"]})', a['parts'], a['delta'], a.get('new_site_price')]
           for a in plan.age], [24, 38, 20, 70, 10, 16], highlight=lambda r: YELLOW if r[4] else None)
    sheet(wb, 'Зміни в прайсі', ['Розділ', 'Послуга', 'Вид', 'Було', 'Стало', '%', 'Позначка клініки'],
          [[c['section'], c['name'], c['kind'], c['old'], c['new'], c['pct'], c['marked']] for c in plan.price_changes]
          + [[g['section'], g['name'], g['kind'], g['price'], 'зникла з прайсу', None,
              'схожі: ' + '; '.join(g['suggest']) if g['suggest'] else ''] for g in plan.gone_items],
          [26, 70, 14, 10, 14, 8, 40], highlight=lambda r: RED if (r[5] is not None and abs(r[5]) > plan.max_pct) or r[4] == 'зникла з прайсу' else None)
    sheet(wb, 'Потребує рішення', ['Де', 'Чому', 'Схожі позиції в прайсі'],
          [[h['where'], h['reason'], '; '.join(h['suggest'])] for h in plan.held], [50, 70, 70])
    path = os.path.join(out_dir, 'report.xlsx')
    wb.save(path)
    return path


def write_outputs(plan, cfg, out_dir, valid_from):
    city_ua = cfg.get('city_ua', cfg['city'])
    with open(os.path.join(out_dir, 'db-update.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['ID (службовий)', 'Ключ БД', 'Назва послуги', 'Місто', 'Нова ціна, грн', 'Ціна до знижки, грн', 'Діє з'])
        n = 0
        for r in plan.db:
            if r.get('same') is False and r.get('ok'):
                n += 1
                w.writerow([f'{cfg["clinic"]}-{n:03d}', f'program:{r["slug"]}', r['name'], cfg['city'],
                            r['new_price'], r['new_price_regular'], valid_from])
    with open(os.path.join(out_dir, 'tilda-manual.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Що', 'Де в Tilda', 'Зараз', 'Поставити', 'Стара ціна (закреслена)'])
        for d in plan.doctors:
            if d.get('diff') and d.get('ok'):
                w.writerow([f'Лікар {d["doctor"]}', f'каталог, SKU {d["sku"]}, колонка Цена', d['site_price'], d['new_site_price'], ''])
        for c in plan.checkups:
            if (c.get('diff') or c.get('new_site_old_price') != c.get('site_old_price')) and c.get('ok'):
                w.writerow([c['label'], f'каталог, SKU {c["sku"]}', c['site_price'], c['new_site_price'], c['new_site_old_price']])
        for a in plan.age:
            if a.get('delta') and a.get('ok'):
                w.writerow([a['label'], f'сторінка {a["page"]}, блок ST310N', a['site_price'], a['new_site_price'], ''])
    with open(os.path.join(out_dir, 'plan.json'), 'w', encoding='utf-8') as f:
        json.dump(plan.as_dict(), f, ensure_ascii=False, indent=1, default=str)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--config', required=True)
    ap.add_argument('--intake', required=True)
    ap.add_argument('--db-json', required=True, help='знімок бази: {"programs": [...], "services": [...]}')
    ap.add_argument('--previous', help='попереднє приймання (CSV у єдиному форматі)')
    ap.add_argument('--valid-from', required=True, help='дата, з якої діють нові ціни (YYYY-MM-DD)')
    ap.add_argument('--out-dir', required=True)
    a = ap.parse_args(argv)
    cfg = json.load(open(a.config, encoding='utf-8'))
    rows, items = load_intake(a.intake)
    db = json.load(open(a.db_json, encoding='utf-8'))
    previous = load_intake(a.previous) if a.previous else None
    plan = Plan(cfg, items, a.valid_from).build(db, previous)
    os.makedirs(a.out_dir, exist_ok=True)
    srcs = sorted({f'{r["source"]} ({r["source_date"]})' for r in rows})
    meta = {'valid_from': a.valid_from, 'sources': ', '.join(srcs),
            'previous': os.path.basename(a.previous) + (' (частковий знімок)' if previous and plan.previous_partial else '') if a.previous else '—',
            'db_snapshot': db.get('_taken', os.path.basename(a.db_json))}
    path = write_report(plan, cfg, a.out_dir, meta)
    write_outputs(plan, cfg, a.out_dir, a.valid_from)
    print(f'Звіт: {path}')
    print(f'Лікарі: {sum(1 for d in plan.doctors if d.get("diff"))} зі змінами з {len(plan.doctors)}; '
          f'чекапи на сайті: {sum(1 for c in plan.checkups if c.get("diff"))} з {len(plan.checkups)}; '
          f'база: {sum(1 for r in plan.db if r.get("same") is False)} з {len(plan.db)}; '
          f'програми за віком: {sum(1 for x in plan.age if x.get("delta"))} з {len(plan.age)}')
    print(f'Змінилось у прайсі: {len(plan.price_changes)}; зникло: {len(plan.gone_items)}; потребує рішення: {len(plan.held)}')


if __name__ == '__main__':
    sys.exit(main())
