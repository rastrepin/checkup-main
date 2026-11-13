#!/usr/bin/env python3
"""Приймання прайсу клініки в єдиний формат.

Читає файли клініки (xlsx, вкладка міста) за описом у конфігу клініки
(scripts/prices/clinics/<clinic>.json, розділ "sources") і пише один CSV
у єдиному форматі: одна позиція прайсу на рядок.

    python3 scripts/prices/intake.py --config scripts/prices/clinics/onclinic-cherkasy.json \
        --file services=/шлях/services.xlsx --file checkups=/шлях/checkups.xlsx \
        --out intake.csv [--source-date services=2026-10-28]

Єдиний формат (колонки CSV) — див. FIELDS нижче. Ключ позиції (key) =
розділ + назва, нормалізовані: у прайсі ОН Клінік немає кодів, а одна й та сама
назва трапляється в різних розділах з різною ціною (ЕКГ у Кардіології 210, у Терапії 300).

Скрипт нічого не змінює ні в базі, ні на сайті.
"""
import argparse
import csv
import json
import re
import sys

import openpyxl

FIELDS = [
    'clinic', 'city', 'source', 'source_tab', 'source_date', 'row',
    'section', 'name', 'key', 'kind', 'price', 'price_full', 'price_raw',
    'marked', 'note', 'duplicate_of',
]


def norm(s):
    """Нормалізована назва для ключа: регістр, лапки, таби, пробіли, апострофи."""
    s = str(s or '')
    s = s.replace(' ', ' ').replace('\t', ' ').replace('\r', ' ').replace('\n', ' ')
    s = re.sub(r'[«»"“”„]', '', s)
    s = re.sub(r"[ʼ’`']", "'", s)
    s = re.sub(r'\s+', ' ', s).strip().lower()
    s = re.sub(r'\s*\(\s*', ' (', s)
    s = re.sub(r'\s*\)', ')', s)
    return s.strip(' .,;')


def make_key(section, name):
    sec = norm(section)
    return f'{sec}|{norm(name)}' if sec else norm(name)


def parse_price(v):
    """650, '650.00', '10848,5', '12 490 грн' → float; порожнє → None; текст → 'nan'."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = re.sub(r'грн|₴', '', str(v), flags=re.I).replace(' ', '').replace(' ', '').replace(',', '.')
    if s == '':
        return None
    try:
        return float(s)
    except ValueError:
        return 'nan'


def kind_for(section, name, rules):
    """Вид позиції (consultation / diagnostics / lab / procedure / checkup) за правилами конфігу."""
    text = f'{section} | {name}'
    for rule in rules:
        if re.search(rule['match'], text, flags=re.I):
            return rule['kind']
    return 'procedure'


def col_index(letter):
    return openpyxl.utils.column_index_from_string(letter) - 1


class _Fill:
    fill_type = None


class _Cell:
    """Комірка CSV з тим самим інтерфейсом, що й у openpyxl (без кольору)."""
    def __init__(self, value, row):
        self.value = value if value != '' else None
        self.row = row
        self.fill = _Fill()


def csv_rows(path, min_row):
    with open(path, encoding='utf-8-sig', newline='') as f:
        for n, r in enumerate(csv.reader(f), start=1):
            if n >= min_row:
                yield [_Cell(v, n) for v in r]


def read_source(src, path, cfg, source_date):
    if path.lower().endswith('.csv'):
        # CSV-експорт однієї вкладки: позначок кольором у ньому немає.
        rows_iter = csv_rows(path, src.get('first_row', 2))
    else:
        wb = openpyxl.load_workbook(path, data_only=True)
        if src['tab'] not in wb.sheetnames:
            raise SystemExit(f'у файлі {path} немає вкладки «{src["tab"]}» (є: {", ".join(wb.sheetnames)})')
        rows_iter = wb[src['tab']].iter_rows(min_row=src.get('first_row', 2))
    cols = {k: col_index(v) for k, v in src['columns'].items()}
    marks = {m.upper(): label for m, label in src.get('marks', {}).items()}
    out = []
    seen = {}
    for r in rows_iter:
        cell = lambda f: r[cols[f]].value if f in cols and cols[f] < len(r) else None
        name = cell('name')
        if name is None or str(name).strip() == '':
            continue
        if src.get('city_value') and cell('city') is not None and norm(cell('city')) != norm(src['city_value']):
            continue
        section = cell('section') if 'section' in cols else src.get('section', '')
        raw = cell('price')
        price = parse_price(raw)
        full = parse_price(cell('price_full')) if 'price_full' in cols else None
        name_cell = r[cols['name']]
        fill = name_cell.fill.fgColor.rgb if name_cell.fill and name_cell.fill.fill_type else None
        note_parts = [str(cell(f)).strip() for f in ('note', 'note2') if f in cols and cell(f)]
        if price == 'nan':
            note_parts.insert(0, f'ціна не число: «{raw}»')
        kind = src.get('kind') or kind_for(section, name, cfg.get('kind_rules', []))
        # Для чекапів «ціна» — зі знижкою клініки, «повна» — без неї.
        row = {
            'clinic': cfg['clinic'], 'city': cfg['city'], 'source': src['id'],
            'source_tab': src['tab'], 'source_date': source_date or '', 'row': name_cell.row,
            'section': re.sub(r'\s+', ' ', str(section or '')).strip(),
            'name': re.sub(r'\s+', ' ', str(name)).strip(),
            'key': make_key(section, name), 'kind': kind,
            'price': '' if price in (None, 'nan') else round(price, 2),
            'price_full': '' if full in (None, 'nan') else round(full, 2),
            'price_raw': '' if raw is None else str(raw).strip(),
            'marked': marks.get(str(fill).upper(), '') if fill else '',
            'note': '; '.join(note_parts), 'duplicate_of': '',
        }
        if row['key'] in seen:
            first = seen[row['key']]
            row['duplicate_of'] = first['row']
            if first['price'] != row['price']:
                row['note'] = (row['note'] + '; ' if row['note'] else '') + \
                    f'повтор рядка {first["row"]} з іншою ціною ({first["price"]})'
        else:
            seen[row['key']] = row
        out.append(row)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--config', required=True)
    ap.add_argument('--file', action='append', default=[], help='id=шлях до xlsx (id джерела з конфігу)')
    ap.add_argument('--source-date', action='append', default=[], help='id=YYYY-MM-DD (дата зміни файлу клініки)')
    ap.add_argument('--out', required=True)
    a = ap.parse_args(argv)
    cfg = json.load(open(a.config, encoding='utf-8'))
    files = dict(x.split('=', 1) for x in a.file)
    dates = dict(x.split('=', 1) for x in a.source_date)
    rows = []
    for src in cfg['sources']:
        if src['id'] not in files:
            raise SystemExit(f'немає файлу для джерела «{src["id"]}» (--file {src["id"]}=...)')
        rows += read_source(src, files[src['id']], cfg, dates.get(src['id']))
    with open(a.out, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    by_src = {}
    for r in rows:
        by_src[r['source']] = by_src.get(r['source'], 0) + 1
    bad = [r for r in rows if r['note'].startswith('ціна не число')]
    dup = [r for r in rows if r['duplicate_of']]
    print(f'Записано {len(rows)} позицій у {a.out}: ' + ', '.join(f'{k} {v}' for k, v in by_src.items()))
    if bad:
        print(f'Ціна не число: {len(bad)} (' + '; '.join(r["name"] for r in bad) + ')')
    if dup:
        print(f'Повтори позицій: {len(dup)} (з іншою ціною: {sum(1 for r in dup if "іншою ціною" in r["note"])})')


if __name__ == '__main__':
    sys.exit(main())
