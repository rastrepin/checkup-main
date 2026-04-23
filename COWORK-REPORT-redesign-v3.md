# COWORK REPORT — Redesign Hub v3
**Дата:** 2026-04-17  
**Виконавець:** Claude (Cowork, автономний режим)  
**Гілка/деплой:** v5.check-up.in.ua  

---

## Що зроблено

### 1. Шрифти — повна заміна
Onest і Cormorant Garamond прибрано з усього проєкту.

- **Fixel Text** (400/500/600/700) — body, UI, кнопки. Self-hosted, `.woff2`, `/public/fonts/`.
- **Fixel Display** (400/600/700) — заголовки H2–H4. Self-hosted, `.woff2`, `/public/fonts/`.
- **Source Serif 4** (500/600/700 + italic) — H1 у Hero, числа Facts Card. Google Fonts CDN у `<head>` через `app/layout.tsx`.

Tailwind v4-токени (`--font-sans`, `--font-display`, `--font-serif`) прописані в `app/globals.css` через `@theme inline`.

### 2. Нові кольорові токени (globals.css → @theme)
`--color-navy` `--color-navy-dark` `--color-teal` `--color-teal-soft`  
`--color-crimson` `--color-crimson-hover` `--color-warm-bg` `--color-dark-bg`  
`--color-border-warm` `--color-text-primary` `--color-text-secondary`

### 3. Компонент MedicalHero (`components/hub/MedicalHero.tsx`)
Замінює старий `HubHero` на обох Hub-сторінках.

- Фон: `bg-gradient-to-br from-[#fcfaf6] to-white` (було `bg-[#05121e]`)
- Eyebrow-pill ("Гінекологія · Поширений діагноз") з teal-dot
- H1 на Source Serif 4 600 з підтримкою `h1Em` — курсивне navy слово всередині заголовку
- 2 CTA: primary navy (з ArrowRight) + ghost outlined — замість 3 кнопок
- Reassurance-рядок: "Інформаційний матеріал — не замінює консультацію лікаря"
- Facts Card: біла картка з тінню, числа на Source Serif 4 40px navy, `letter-spacing: -0.02em`
- Grid: `1.3fr / 1fr`, `items-center`
- Props: `diagnosisLabel`, `eyebrow`, `h1`, `h1Em`, `lead`, `primaryHref`, `secondaryHref`, `facts`, `headingId`

### 4. Компонент Button (`components/ui/Button.tsx`)
- 1 слово → UPPERCASE, tracking-[0.1em], font-bold 700
- 2+ слова → Sentence case, font-semibold 600, іконка-стрілка
- Варіанти: `primary` (navy), `ghost` (outlined navy), `crimson`
- Підтримує `href` (рендерить `<a>`) і `onClick` (рендерить `<button>`)

### 5. Redesign /cases/mioma-matky
- `HubHero` замінено на `MedicalHero` з фактами для міоми (7 з 10, 6 методів, 12 клінік, 28 лікарів)
- Spacing між секціями: `pt-16 md:pt-24 lg:pt-32` (64/96/128px)
- H2 "Методи лікування": `md:text-3xl`, Fixel Display через `style`

### 6. Redesign /cases/endometrioz
- Inline hero-секція (dark bg) замінена на `<MedicalHero>` з фактами для ендометріозу (1 з 10, 2 підходи, 10 клінік, 22 лікарі)
- Аналогічний spacing по всіх 13 секціях
- H2 "Методи лікування" і "Вартість лікування": Fixel Display через `style`

### 7. Глобальне прибирання Onest/Cormorant
- `app/layout.tsx` — видалено `import { Onest } from 'next/font/google'` та `className={onest.variable}`, додано `<link>` Source Serif 4
- `components/shared/LeadForm.tsx` — `font-[Onest,system-ui]` → `font-sans`
- `components/hub/HubHero.tsx` — `Cormorant Garamond` → `Source Serif 4`
- `components/symptom/SymptomHero.tsx` — аналогічно
- `app/careway/simptomy/bil-pid-chas-statevoho-aktu/page.tsx` — аналогічно

---

## Які проблеми виявлено

### Під час деплою
| # | Проблема | Файл | Вирішення |
|---|---|---|---|
| 1 | Truncated/EOF помилки у 11 hub-компонентах | `components/hub/*.tsx` | Python-скрипти (`fix_hub_1/2/3.py`) перезаписали файли через Linux-mount |
| 2 | `QuizClinical.tsx:211` — `Expected '</', got '<eof>'` | `components/hub/QuizClinical.tsx` | Дозаписано відсутні 5 закриваючих рядків |
| 3 | `Accordion.tsx:87` — `Property 'di' does not exist` | `components/shared/Accordion.tsx` | Файл обрізаний на `</di` — перезаписано повний вміст |
| 4 | `supabaseUrl is required` при `/kharkov` page data collection | `lib/supabase.ts` | Supabase env vars були тільки для `production` target — додано для `preview` через Vercel REST API |
| 5 | `LeadForm.tsx:206` — `Expression expected` / `Unterminated regexp literal` | `components/shared/LeadForm.tsx` | Дублікат `</form>);}`  наприкінці файлу — видалено |

### Виявлені UX-проблеми (ще не виправлені, потребують наступної ітерації)
1. **H1 занадто широкий на 1920px** — розтягується в 1.5 рядки; потрібен `max-w-[580px]`
2. **Facts Card занадто широка на 1920px** — колонка ~600px, картка виглядає порожньою
3. **H2 типографіка не оновлена всередині sub-components** — OrientationBlock, PatientPath, WhenToActBlock, SymptomsBlock та ін. залишились із `text-[22px] mb-1` без Fixel Display
4. **OrientationBlock — внутрішній spacing тісний** — `mb-1` після H2, `py-8` замало
5. **MethodCards нумерація** — `6.1`, `6.2`... у title зайва, заплутує
6. **WhenToActBlock H2** — "Коли спостереження ок, а коли діяти" — неформально і нечітко
7. **PatientPath крок 3** — текст "Після рішення про лікування — перехід до..." слабкий
8. **PricingBlock** — заголовок "НСЗУ чи приват" незрозумілий; синій блок НСЗУ не асоціюється з контекстом; потрібна уніфікація з navy-teal

---

## Які файли змінено

```
app/globals.css
  — @font-face Fixel Text (400/500/600/700)
  — @font-face Fixel Display (400/600/700)
  — @theme inline: нові кольорові токени, --font-sans/display/serif, --shadow-card/cta
  — видалено --font-onest

app/layout.tsx
  — видалено: import { Onest } from 'next/font/google' та onest.variable
  — додано: <link> Google Fonts CDN для Source Serif 4

app/cases/mioma-matky/page.tsx
  — HubHero → MedicalHero з props
  — додано FACTS масив
  — spacing між секціями: pt-16 md:pt-24 lg:pt-32
  — H2 "Методи лікування": Fixel Display + md:text-3xl

app/cases/endometrioz/page.tsx
  — inline hero-section → <MedicalHero />
  — додано FACTS_ENDO масив
  — spacing у 13 секціях: py-8 → pt-16 md:pt-24 lg:pt-32 pb-8
  — H2 "Методи" і "Вартість": Fixel Display

components/hub/MedicalHero.tsx     [NEW]
components/ui/Button.tsx           [NEW]

components/shared/LeadForm.tsx
  — font-[Onest,system-ui] → font-sans (3 поля форми)
  — видалено дублікат </form>);} наприкінці файлу

components/hub/HubHero.tsx
  — Cormorant Garamond → Source Serif 4

components/symptom/SymptomHero.tsx
  — Cormorant Garamond → Source Serif 4 / Onest → Fixel Text

app/careway/simptomy/bil-pid-chas-statevoho-aktu/page.tsx
  — Cormorant Garamond → Source Serif 4 / Onest → Fixel Text

public/fonts/FixelText-Regular.woff2    [NEW, 45 964 bytes]
public/fonts/FixelText-Medium.woff2     [NEW, 55 624 bytes]
public/fonts/FixelText-SemiBold.woff2   [NEW, 56 012 bytes]
public/fonts/FixelText-Bold.woff2       [NEW, 56 604 bytes]
public/fonts/FixelDisplay-Regular.woff2 [NEW, 46 424 bytes]
public/fonts/FixelDisplay-SemiBold.woff2[NEW, 55 996 bytes]
public/fonts/FixelDisplay-Bold.woff2    [NEW, 55 808 bytes]
```

---

## Production URLs

| Сторінка | URL |
|---|---|
| Hub міоми | https://v5.check-up.in.ua/cases/mioma-matky |
| Hub ендометріозу | https://v5.check-up.in.ua/cases/endometrioz |

Поточний деплой: `check-up-kyiv-j89dnjxj9-rastrepins-projects.vercel.app`  
Аліас: `https://v5.check-up.in.ua`

---

## Відомі нюанси

### Fixel потребує preconnect у `<head>`
Fixel завантажується із `/public/fonts/` (self-hosted), але Source Serif 4 іде через Google Fonts CDN. У `app/layout.tsx` вже є:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```
Для Fixel preconnect не потрібен (self-hosted), але якщо виникне FOUT на перших рендерах — можна додати `<link rel="preload" as="font" href="/fonts/FixelText-Regular.woff2" crossOrigin="anonymous" />` для 400 і 600.

### Supabase fallback → `data/fallback-content.json`
Більшість динамічних даних (лікарі, клініки, НСЗУ-пакети, ціни) наразі — hardcoded заглушки з `// TODO: replace with Supabase`. Коли Supabase-таблиці будуть готові, рекомендується зробити проміжний fallback-шар: `data/fallback-content.json` з усіма TODO-значеннями. Це дозволить Vercel preview-деплоям не падати при відсутності даних і спростить міграцію на live-дані без зміни компонентів.

### Tailwind v4 — немає `tailwind.config.js`
Проєкт використовує Tailwind CSS v4. Конфігурація (кольори, шрифти, тіні) знаходиться виключно в `app/globals.css` через `@theme inline`. Немає `tailwind.config.js` — не шукати. Додавати нові токени тільки через `@theme`.

### Vercel env vars — production vs preview
Supabase змінні (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) були налаштовані тільки для `production` target. Preview-деплої падали з `supabaseUrl is required`. Виправлено 2026-04-17: обидві змінні додані для `preview` target через Vercel REST API. При наступному rotate ключів — оновити обидва targets.

### `crossOrigin` у `<link>` (Next.js 15+)
Next.js 15+ вимагає camelCase `crossOrigin="anonymous"` у JSX замість `crossorigin`. Уже враховано в `layout.tsx`. Не міняти на lowercase — build впаде.

### HubHero.tsx залишається у репо
`components/hub/HubHero.tsx` більше не використовується (обидва Hub замінені на `MedicalHero`), але файл збережено. Якщо плануєте прибрати — перевірте `grep -r "HubHero"` перед видаленням.
