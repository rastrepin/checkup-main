# Конвеєр міграції сторінок чекапу з Tilda

Вікові сторінки (жінки й чоловіки, 4 кроки) мають один шаблон на крок:
`app/ukr/{female,male}-checkup/{вік}/city-page.tsx`. Сторінка міста – тонка обгортка
`{вік}/{slug}/page.tsx`. Програми, ціни, склад і філії шаблон бере з Supabase
за `clinicSlug` міста. Харків зібрано з цього ж шаблону.

Сторінки типу 5 (хвиля 1, 01.11.2026): хаб міста `app/ukr/city-page.tsx` → `app/ukr/{slug}/page.tsx`,
«Жінкам» і «Чоловікам» – спільний шаблон `components/city/GenderHubPage.tsx` (обгортки
`app/ukr/{female,male}-checkup/city-page.tsx` → `app/ukr/{stat}-checkup/{slug}/page.tsx`).
Тексти – `content/city-template/{city,female-checkup,male-checkup}.md` (CITY-HUB-TEXTS v1.6 дослівно; решта сторінок
статі – v0 без змін). Файл ділиться на секції `## ключ` (title, h1, lead_a/lead_b, meta_*, faq, geo_* …); суфікс
`_a` / `_b` – варіант А (одна клініка в `city.clinics`) або Б (кілька). Плейсхолдери: `{city}`, `{city_loc}`,
`{in_city}`, `{city_slug}`, `{slug}`, `{min_price}`, `{clinic}`, `{clinic_url}`, `{branch_list}`, `{clinics_count}`,
`{google_rating}`, `{google_reviews}`. Абзац, пункт списку чи питання FAQ з незаповненим плейсхолдером не рендериться
(FAQPage у JSON-LD = видимий FAQ). `{min_price}` – один розрахунок для meta і рядка ціни (`lib/cities/hub-data.ts`);
немає цін – meta з секції `*_noprice`. Картки клінік – `components/city/ClinicCard.tsx` (дані – Supabase `clinics`,
`clinic_branches`; клініки немає в базі – картки, GEO і ціни для неї немає). Телефонів на цих сторінках немає.
Харків має й старі файли `content/kharkiv/…` – шаблони їх більше не читають.

Склад програми: `program_services ⨝ clinic_services`; якщо там для програми порожньо – запасний шлях
з `checkup_programs.composition` у форматі файлів міст (`consultations`, `diagnostics`, `analyses` – масиви
рядків, `visits`), позиції показуються своїми назвами (`lib/programs/composition.ts`).

Кроки для нового міста:

1. Дані в Supabase: філії клініки (`clinic_branches`), програми клініки зі складом і цінами
   (`checkup_programs`, `program_services`), зв'язок з віковими кроками (`platform_program_offers`).
   Запис у production-базу – лише після погодження.
2. Запис міста в `lib/cities/checkup-cities.ts`: назва, місцевий відмінок («Миколаєві»), `inCity` («у Миколаєві» /
   «в Ужгороді» – дослівно для текстів хабу), клініка вікових сторінок (`clinicSlug`), клініки хабу (`clinics` –
   slug і сторінка клініки на Tilda; 2+ клініки – варіант Б), «Інші послуги» (`otherServices: {}` – у хвилі 1 порожньо,
   рішення Ігоря 07.11.2026: дитячий чекап додамо пізніше, колоноскопія і планування вагітності – друга хвиля), лікар-рецензент жіночих вікових сторінок або `null`, папка текстів (`contentDir: 'city-template'`),
   `ruSlug` (довідково; hreflang у хвилі 1 не виводиться) або `null`.
3. `node scripts/cities/new-city-pages.mjs {slug}` – створює 11 обгорток: 8 вікових, хаб і дві сторінки статі.
4. Меню шапки міста в `lib/nav/header.ts`: Чоловікам · Жінкам · Лікарі · Про сервіс (без «Дітям», «Спеціалізовані»
   і «Сертифікат» – рішення Ігоря 07.11.2026). Без запису шапка – варіант без міста.
5. Перевірка на прев'ю з `?drafts=1`.
6. 301 зі старих адрес Tilda – записи в `lib/seo/redirects-wave1.json` (source, destination, class, city, match:
   `path-and-children` – адреса з усім під нею, `tproduct-id` – картка товару за id). Правило діє лише коли його ціль
   є в `approved-routes.json`; `scripts/check-routes.mjs` валить білд, якщо ціль – не сторінка Next.js, ланцюжок або
   дубль. Активні джерела зникають з `/sitemap-tilda.xml` і `/sitemap-store.xml` (останній Next.js обслуговує лише
   коли є хоч один активний 301; доти – Tilda через проксі).
7. Перемикання з Tilda: адреси в `lib/seo/approved-routes.json`. Це вмикає сторінки на домені і 301 до них,
   тому злиття – за власником.

## Перевірка міста (пункти 2.2)

`scripts/cities/check-city.mjs` – автоматичні пункти чек-листа 2.2 з CONVEYOR-CITIES v1.2.1 (checkup-platform, розділ 3.1)
для 11 сторінок міста. Скрипт лише читає: відкриває сторінки і JS сайту, читає Supabase публічним ключем сайту.
Заявок не надсилає, форму не відкриває і не заповнює, у базу не пише.

```
node scripts/cities/check-city.mjs --base https://check-up.in.ua --city kharkiv --city uzhgorod
node scripts/cities/check-city.mjs --base <адреса прев'ю> --city dnipro --drafts
```

- Node ≥ 22.18 (конфіг міст читається прямо з `lib/cities/checkup-cities.ts`), залежностей немає.
- `NEXT_PUBLIC_SUPABASE_URL` і `NEXT_PUBLIC_SUPABASE_ANON_KEY` – для звірки цін, клінік і адрес з базою. Без них такі
  пункти – «НЕ ПЕРЕВІРЕНО», не ТАК. `VERCEL_AUTOMATION_BYPASS_SECRET` – для захищеного прев'ю.
- Звіт – `city-check.md` (таблиця сторінка × пункт і докази для кожного NO) і `city-check.json` (усі докази). Папка – `--out`.
  Код виходу 0 – усе ТАК, 1 – є NO або «НЕ ПЕРЕВІРЕНО», 2 – помилка запуску.

Що перевіряє (номер – пункт у звіті):
1. HTTP 200, сторінка з Next.js (не Tilda), один H1, Title і Meta = шаблон (вікові – `titleFor` і `DESCRIPTION_BASE`
   з `city-page.tsx` плюс ціна з бази; хаби – секції `title`, `meta_*` з `content/city-template/*.md`), canonical на себе.
2. Вікові: Offer у JSON-LD для кожної картки, ціна = `price_discount` у базі. Хаби: FAQPage = видимий FAQ, Offer немає.
3. Вікові: `data-price` картки і «Ціна клініки станом на …» = `price_discount` і `price_date` у базі. Хаби: «Програми від X грн» = мінімум у базі.
4. «Що входить» у кожній картці не порожній; фрази «поки не опублікований» немає.
5. GEO в серверному HTML: абзац з містом, назва кожної клініки, усі адреси філій з бази (варіант Б – усі клініки з конфігу).
6. Шапка міста і футер за HEADER-SPEC (пункти, email, застереження, «© рік Check-Up Центр», заборонених посилань немає).
7. Немає `tel:`, `telephone`, посилань на сайт чи сторінку клініки, незаповнених `{…}`, `[УТОЧНИТИ`.
8. Вікові: кнопка «Записатися»; у JS сторінки – форма з POST `/api/leads`, honeypot `website`, чекбокс згоди, `consent_given`.
10. Рецензент: видимий блок і `reviewedBy` у JSON-LD разом або обидва відсутні.

Вручну (скрипт не робить): форма до кроку «Далі», канал заявок, згода рецензента, Lighthouse.
