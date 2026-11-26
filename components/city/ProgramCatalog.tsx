'use client';

// Каталог програм клінік на хабі статі – клієнтська частина (gender-hub v0.1 §3–§5; задача НОРМАТИВ 26.11).
// Сервер віддає ВСІ картки і ВСІ рамки в HTML (серверний HTML не залежить від фільтра, рамки приховані атрибутом hidden);
// тут – лише керування: фільтр «Вік» (#age=, без параметра ?age=), сортування (понад 4 програми), «Показати ще»,
// «Показано N з M», одна відкрита рамка, закріплена панель mobile (§5.1).
// Одна crimson-кнопка на екрані (ui-kit §6.1): у списку кнопок запису немає, у відкритій рамці – одна,
// панель «Записатися · {ціна}» з'являється лише коли кнопки рамки не видно.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookCta } from '@/components/city/BookingFlow';
import { catalogEvents } from '@/lib/ga4';
import { fillLabel } from '@/lib/format/labels';
import { formatPrice } from '@/lib/format/price';
import { ageFromHash, CATALOG_AGES, programMatchesAge } from '@/lib/programs/catalog-age';
import type { AgeSegment } from '@/lib/plan/age-groups';

export interface CatalogItem {
  /** `${clinicSlug}-${programSlug}`; id рамки – `clinic-${key}` (якір #clinic-{clinicSlug}-{programSlug}). */
  key: string;
  clinicSlug: string;
  programSlug: string;
  /** checkup_programs.age_group. */
  ageGroup: string | null;
  /** Ціна до сплати; null – ціни немає. */
  price: number | null;
  hasDiscount: boolean;
  /** Картка (сервер): всередині неї – FrameToggle. */
  card: ReactNode;
  /** Рамка програми (сервер): ProgramCard + адреси + ціна + одна кнопка запису. */
  frame: ReactNode;
  /** id блоку ціни і кнопки запису в рамці – панель mobile ховається, поки він на екрані. */
  buyId: string;
}

/** Тексти керування з .md (`## catalog`); ключа немає – елемента немає. {n}, {total}, {k}, {group_gen} підставляє клієнт. */
export interface CatalogUiTexts {
  filterLabel: string | null;
  filterAll: string | null;
  filterAges: string[];
  sortLabel: string | null;
  sortOptions: string[];
  sortNote: string | null;
  shown: string | null;
  more: string | null;
  empty: string | null;
  emptyPlanLink: string | null;
  emptyAllLink: string | null;
}

type Sort = 'default' | 'cheap';

interface CatalogCtx {
  openKey: string | null;
  toggle: (key: string) => void;
}
const Ctx = createContext<CatalogCtx | null>(null);

/** «Програма і запис →» у картці: розкриває рамку під карткою (одна відкрита). */
export function FrameToggle({ itemKey, label }: { itemKey: string; label: string }) {
  const ctx = useContext(Ctx);
  const open = ctx?.openKey === itemKey;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`clinic-${itemKey}`}
      onClick={() => ctx?.toggle(itemKey)}
      className="inline-flex items-center min-h-[44px] text-[15px] font-semibold text-link hover:underline underline-offset-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)] rounded-[var(--radius-sm)]"
    >
      {label}
    </button>
  );
}

const MOBILE_LIMIT = 5;
const DESKTOP_LIMIT = 8;
/** Сортування з'являється, коли програм у каталозі більше 4 (§3.3). */
const SORT_FROM = 5;

const SELECT =
  'min-h-[44px] w-full sm:w-auto rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3 text-[15px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)]';

export default function ProgramCatalog({
  items,
  texts,
  groupGen,
  ageHref,
  sourceCta,
  bookLabel,
}: {
  items: CatalogItem[];
  texts: CatalogUiTexts;
  /** {group_gen} за віком: «жінок до 30 років». */
  groupGen: Record<AgeSegment, string>;
  /** Адреса вікової сторінки за віком (посилання порожнього результату). */
  ageHref: Record<AgeSegment, string>;
  /** source_cta ліда каталогу: 'catalog'. */
  sourceCta: string;
  /** «Записатися · {price}» – напис панелі mobile. */
  bookLabel: string;
}) {
  const total = items.length;
  const [age, setAge] = useState<AgeSegment | ''>('');
  const [sort, setSort] = useState<Sort>('default');
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [buyOnScreen, setBuyOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef<string | null>(null);

  const ordered = useMemo(() => {
    if (sort === 'default') return items;
    return items
      .map((it, i) => ({ it, i }))
      .sort((a, b) => {
        const pa = a.it.price ?? Number.POSITIVE_INFINITY;
        const pb = b.it.price ?? Number.POSITIVE_INFINITY;
        return pa - pb || a.i - b.i;
      })
      .map((x) => x.it);
  }, [items, sort]);

  const passes = useCallback((it: CatalogItem) => (age ? programMatchesAge(it.ageGroup, age) : true), [age]);
  const filtered = useMemo(() => ordered.filter(passes), [ordered, passes]);
  const filteredKeys = useMemo(() => new Set(filtered.map((i) => i.key)), [filtered]);
  const n = filtered.length;

  const scrollToCatalog = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rootRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // Фільтр у фрагменті адреси без перезавантаження і без стрибка прокрутки (history.replaceState).
  const writeAgeHash = (next: AgeSegment | '') => {
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', next ? `${base}#age=${next}` : base);
  };

  const applyAge = useCallback(
    (next: AgeSegment | '', source: 'link' | 'manual') => {
      setAge(next);
      setExpanded(false);
      writeAgeHash(next);
      if (source === 'link') scrollToCatalog();
      catalogEvents.listFilter({ filter: 'age', value: next || 'all', source });
    },
    [scrollToCatalog],
  );

  // Адреса: #age={вік} відкриває сторінку з фільтром; #clinic-{клініка}-{програма} – з відкритою рамкою (фільтр скидається).
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash;
      const a = ageFromHash(hash);
      if (a) {
        setAge(a);
        setExpanded(false);
        // Перехід з вікової сторінки (#age=…) або зі зміни адреси: фільтр + прокрутка до каталогу.
        scrollToCatalog();
        catalogEvents.listFilter({ filter: 'age', value: a, source: 'link' });
        return;
      }
      const m = hash.match(/^#clinic-(.+)$/);
      if (m && items.some((i) => i.key === m[1])) {
        setAge('');
        setOpenKey(m[1]);
      }
    };
    read();
    const onHash = () => read();
    window.addEventListener('hashchange', onHash);
    // Повторний клік по тій самій віковій картці не змінює хеш – ловимо клік по посиланнях `a[data-catalog-age]`.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[data-catalog-age]') as HTMLAnchorElement | null;
      if (!link) return;
      const a = ageFromHash(`#age=${link.dataset.catalogAge}`);
      if (!a) return;
      e.preventDefault();
      applyAge(a, 'link');
    };
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Відкрита рамка, що не проходить новий фільтр, закривається (§3.2).
  useEffect(() => {
    if (openKey && !filteredKeys.has(openKey)) setOpenKey(null);
  }, [openKey, filteredKeys]);

  const toggle = useCallback(
    (key: string) => {
      setOpenKey((cur) => {
        if (cur === key) return null;
        const it = items.find((i) => i.key === key);
        if (it) {
          const position = filtered.findIndex((i) => i.key === key) + 1;
          catalogEvents.clinicOpen({
            clinic: it.clinicSlug,
            program: it.programSlug,
            position,
            sort,
            filters: age || 'all',
            has_discount: it.hasDiscount,
          });
        }
        return key;
      });
    },
    [items, filtered, sort, age],
  );

  // Після відкриття (особливо після відкриття іншої рамки) – прокрутка до рамки.
  useEffect(() => {
    if (openKey && openKey !== prevOpen.current) {
      const el = document.getElementById(`clinic-${openKey}`);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: prevOpen.current ? 'start' : 'nearest' });
    }
    prevOpen.current = openKey;
  }, [openKey]);

  // Панель mobile: рамку відкрито, а її кнопка запису поза екраном.
  const openItem = openKey ? items.find((i) => i.key === openKey) ?? null : null;
  useEffect(() => {
    setBuyOnScreen(false);
    if (!openItem || typeof IntersectionObserver === 'undefined') return;
    const el = document.getElementById(openItem.buyId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBuyOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [openItem]);

  const showControls = total > 1;
  const showSort = total >= SORT_FROM && texts.sortOptions.length >= 2 && texts.sortLabel;
  const showFilter = showControls && Boolean(texts.filterLabel) && Boolean(texts.filterAll) && texts.filterAges.length === CATALOG_AGES.length;
  const kMobile = Math.max(0, n - MOBILE_LIMIT);
  const kDesktop = Math.max(0, n - DESKTOP_LIMIT);
  const hiddenClass = (idx: number) => {
    if (expanded) return '';
    if (idx >= DESKTOP_LIMIT) return 'hidden';
    if (idx >= MOBILE_LIMIT) return 'hidden lg:block';
    return '';
  };
  const rank = new Map(filtered.map((it, i) => [it.key, i]));

  return (
    <Ctx.Provider value={{ openKey, toggle }}>
      <div ref={rootRef} className="scroll-mt-20">
        {(showFilter || showSort) && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
            {showFilter && (
              <label className="flex flex-col gap-1 text-[14px] text-text-secondary">
                {texts.filterLabel}
                <select value={age} onChange={(e) => applyAge(ageFromHash(`#age=${e.target.value}`) ?? '', 'manual')} className={SELECT}>
                  <option value="">{texts.filterAll}</option>
                  {CATALOG_AGES.map((seg, i) => (
                    <option key={seg} value={seg}>
                      {texts.filterAges[i]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {showSort && (
              <label className="flex flex-col gap-1 text-[14px] text-text-secondary">
                {texts.sortLabel}
                <select
                  value={sort}
                  onChange={(e) => {
                    const v: Sort = e.target.value === 'cheap' ? 'cheap' : 'default';
                    setSort(v);
                    setExpanded(false);
                    catalogEvents.listSort({ value: v });
                  }}
                  className={SELECT}
                >
                  <option value="default">{texts.sortOptions[0]}</option>
                  <option value="cheap">{texts.sortOptions[1]}</option>
                </select>
              </label>
            )}
          </div>
        )}
        {showControls && sort === 'default' && texts.sortNote && <p className="mt-2 text-[13px] leading-snug text-text-secondary">{texts.sortNote}</p>}
        {showControls && texts.shown && (
          <p aria-live="polite" className="mt-3 text-[14px] text-text-secondary">
            {fillLabel(texts.shown, { n, total })}
          </p>
        )}

        {showControls && n === 0 && (
          <div className="mt-4 text-[15px] leading-relaxed text-ink">
            {texts.empty && <p>{texts.empty}</p>}
            <p className="mt-3 flex flex-col gap-1 sm:flex-row sm:gap-6">
              {age && texts.emptyPlanLink && (
                <a href={ageHref[age]} className="inline-flex items-center min-h-[44px] font-semibold text-link hover:underline underline-offset-[3px]">
                  {fillLabel(texts.emptyPlanLink, { group_gen: groupGen[age] })}
                </a>
              )}
              {texts.emptyAllLink && (
                <button
                  type="button"
                  onClick={() => applyAge('', 'manual')}
                  className="inline-flex items-center min-h-[44px] text-left font-semibold text-link hover:underline underline-offset-[3px]"
                >
                  {texts.emptyAllLink}
                </button>
              )}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
          {ordered.map((it) => {
            const idx = rank.get(it.key);
            const visible = idx !== undefined;
            return (
              <FragmentRow
                key={it.key}
                item={it}
                visible={visible}
                limitClass={visible ? hiddenClass(idx) : 'hidden'}
                open={openKey === it.key}
              />
            );
          })}
        </div>

        {!expanded && n > MOBILE_LIMIT && texts.more && (
          <div className={`mt-4 ${n > DESKTOP_LIMIT ? '' : 'lg:hidden'}`}>
            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                catalogEvents.listMore({ shown: n, total });
              }}
              className="inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto px-6 rounded-[var(--radius-lg)] border-[1.5px] border-[var(--link)] bg-white text-[16px] font-bold text-link hover:bg-bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)]"
            >
              <span className="lg:hidden">{fillLabel(texts.more, { k: kMobile })}</span>
              <span className="hidden lg:inline">{fillLabel(texts.more, { k: kDesktop })}</span>
            </button>
          </div>
        )}
      </div>

      {/* Закріплена панель mobile (§5.1): рамку відкрито, її «Записатися» поза екраном. Desktop – панелі немає. */}
      {openItem && openItem.price !== null && !buyOnScreen && (
        <div
          className="fixed bottom-0 inset-x-0 z-[150] md:hidden bg-white border-t border-[var(--border)] px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
          style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}
        >
          <BookCta
            programSlug={openItem.programSlug}
            sourceCta={sourceCta}
            lead={{ variant: 3, entryPoint: 'page' }}
            label={fillLabel(bookLabel, { price: formatPrice(openItem.price) })}
          />
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Картка і її рамка – сусідні елементи сітки: відкрита рамка займає весь рядок під карткою (§4.3). */
function FragmentRow({ item, visible, limitClass, open }: { item: CatalogItem; visible: boolean; limitClass: string; open: boolean }) {
  return (
    <>
      <div hidden={!visible} className={limitClass}>
        {item.card}
      </div>
      <div id={`clinic-${item.key}`} hidden={!open || !visible} className="lg:col-span-full scroll-mt-20">
        {item.frame}
      </div>
    </>
  );
}
