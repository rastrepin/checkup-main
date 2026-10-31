# Конвеєр міграції сторінок чекапу з Tilda

Вікові сторінки (жінки й чоловіки, 4 кроки) мають один шаблон на крок:
`app/ukr/{female,male}-checkup/{вік}/city-page.tsx`. Сторінка міста – тонка обгортка
`{вік}/{slug}/page.tsx`. Програми, ціни, склад і філії шаблон бере з Supabase
за `clinicSlug` міста. Харків зібрано з цього ж шаблону.

Сторінки типу 5 (31.10.2026) зібрано так само: хаб міста `app/ukr/city-page.tsx` → `app/ukr/{slug}/page.tsx`,
«Жінкам» і «Чоловікам» `app/ukr/{female,male}-checkup/city-page.tsx` → `app/ukr/{stat}-checkup/{slug}/page.tsx`.
Тексти – з MD: Харків `content/kharkiv/{city,female-checkup,male-checkup}.md`, нові міста
`content/city-template/…` (ті самі тексти з плейсхолдерами `{city}`, `{city_loc}`, `{city_slug}`).
Необов'язкові блоки хабу рендеряться, лише коли є файл у `content/{contentDir}/` міста:
`what-is-checkup.md` (або `what-is-checkup-{slug}.md`), `how-it-works-single.md` / `how-it-works-multi.md`
(за кількістю клінік міста), `team.md`. Плейсхолдери в них: `{city}`, `{city_loc}`, `{city_slug}`, `{clinic}`, `{clinics_count}`.

Склад програми: `program_services ⨝ clinic_services`; якщо там для програми порожньо – запасний шлях
з `checkup_programs.composition` у форматі файлів міст (`consultations`, `diagnostics`, `analyses` – масиви
рядків, `visits`), позиції показуються своїми назвами (`lib/programs/composition.ts`).

Кроки для нового міста:

1. Дані в Supabase: філії клініки (`clinic_branches`), програми клініки зі складом і цінами
   (`checkup_programs`, `program_services`), зв'язок з віковими кроками (`platform_program_offers`).
   Запис у production-базу – лише після погодження.
2. Запис міста в `lib/cities/checkup-cities.ts`: назва, місцевий відмінок («Миколаєві»), клініка,
   лікар-рецензент жіночих сторінок або `null` (тоді блоку рецензента і reviewedBy немає),
   папка текстів (`contentDir: 'city-template'`), `ruSlug` (hreflang ru) або `null`.
3. `node scripts/cities/new-city-pages.mjs {slug}` – створює 11 обгорток: 8 вікових, хаб і дві сторінки статі.
4. Меню шапки міста в `lib/nav/header.ts` (дослівно з шапки Tilda міста). Без запису шапка – варіант без міста.
5. Перевірка на прев'ю з `?drafts=1`.
6. Перемикання з Tilda: адреси в `lib/seo/approved-routes.json` і 301 зі старих адрес Tilda.
   Це вмикає сторінки на домені, тому злиття – за власником.
