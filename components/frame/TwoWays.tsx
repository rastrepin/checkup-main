// Каркас: «Два способи пройти чекап» (age-page-zones v0.6 §2.3, рішення Ігоря 06.11).
// Одразу після «Які обстеження рекомендують», перед «Мій план». Дві нейтральні картки-якорі (не вкладки):
// «Мій план» → #plan і «Програма клініки» → #programs. Без кольорів клінік, без порівняння плану і програми.
// Тексти – ключ 3a_ways у .md сторінки (content/kharkiv/{стать}-{вік}.md); ключа або рядка немає – чернетки з §2.3.
// {min} – найменша ціна до сплати серед програм сторінки; рахує сторінка тією самою функцією, що й ціну в meta.
// Програм немає (min = null) – секції немає.

import type { CheckupCity } from '@/lib/cities/checkup-cities';
import { fillPlaceholders, loadCityMdSections } from '@/lib/content/city-md';
import Eyebrow from './Eyebrow';

/** Тека з .md вікових сторінок: шаблони однакові для всіх міст (як у MyPlan). */
const AGE_MD_DIR = 'kharkiv';

/** Чернетки UX (§2.3) – діють, поки Контент не заповнив ключ 3a_ways. */
const DRAFT = {
  h2: 'Два способи пройти чекап',
  plan_eyebrow: 'Від платформи',
  plan_title: 'Мій план',
  plan_text: 'Ви обираєте дослідження за настановами. Ціна – сума обраного за прайсом клініки.',
  plan_link: 'Скласти план ↓',
  program_eyebrow: 'Від клініки',
  program_title: 'Програма клініки',
  program_text: 'Готовий набір, який склала клініка: консультації, аналізи, УЗД і розбір результатів.',
  program_link: 'Дивитися програми ↓',
  note: 'Обидва способи закінчуються консультацією лікаря. Повний комплекс визначає лікар.',
};
type Key = keyof typeof DRAFT;

function waysTexts(mdName: string, city: CheckupCity): Record<Key, string> {
  const vars = { city: city.name, city_loc: city.loc, city_slug: city.slug, in_city: city.inCity };
  const raw = loadCityMdSections(AGE_MD_DIR, mdName, vars)?.raw['3a_ways'] ?? '';
  const out = { ...DRAFT };
  for (const k of Object.keys(DRAFT) as Key[]) {
    const m = raw.match(new RegExp(`^${k}:\\s*"(.*)"\\s*$`, 'm'));
    const v = m ? fillPlaceholders(m[1], vars).trim() : '';
    if (v && !/\{[A-Za-z_0-9]+\}/.test(v)) out[k] = v;
  }
  return out;
}

function fmt(n: number) {
  return n.toLocaleString('uk-UA');
}

const CARD =
  'flex flex-col gap-2 p-[18px] bg-white border border-[var(--border)] rounded-[var(--radius-lg)] text-ink no-underline hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link)]';
const LINK = 'mt-1 text-[15px] font-semibold text-link';

export default function TwoWays({ mdName, city, minPrice }: { mdName: string; city: CheckupCity; minPrice: number | null }) {
  if (minPrice === null) return null;
  const t = waysTexts(mdName, city);
  return (
    <section id="ways" aria-labelledby="ways-h2" className="bg-bg-muted border-t border-section-border scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-14 py-[var(--space-section)]">
        <h2 id="ways-h2" className="font-display font-bold text-ink text-[26px] lg:text-[32px] leading-[1.2]">
          {t.h2}
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 max-w-[960px]">
          <a href="#plan" className={CARD}>
            <Eyebrow as="span">{t.plan_eyebrow}</Eyebrow>
            <span className="text-[20px] font-bold leading-snug">{t.plan_title}</span>
            <span className="text-[15px] leading-[1.55] text-ink">{t.plan_text}</span>
            <span className={LINK}>{t.plan_link}</span>
          </a>
          <a href="#programs" className={CARD}>
            <span className="flex items-center gap-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
              <span aria-hidden="true" className="shrink-0 w-1.5 h-1.5 rounded-[2px] border-[1.5px] border-[var(--text-secondary)]" />
              <span>{t.program_eyebrow}</span>
            </span>
            <span className="text-[20px] font-bold leading-snug">{t.program_title}</span>
            <span className="text-[15px] leading-[1.55] text-ink">{t.program_text}</span>
            <span className="text-[20px] font-bold leading-snug" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              від {fmt(minPrice)} грн
            </span>
            <span className={LINK}>{t.program_link}</span>
          </a>
        </div>
        <p className="mt-3 text-[13px] leading-[1.5] text-text-secondary">{t.note}</p>
      </div>
    </section>
  );
}
