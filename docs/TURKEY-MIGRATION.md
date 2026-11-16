# TURKEY-MIGRATION – міграція сторінок «Чекап у Туреччині» з Tilda

Версія: 0.2 · 16.11.2026
Власник: чат ТУРЕЧЧИНА · міграція з Tilda (проєкт «check-up · Міграція check-up.in.ua на Next.js»)
Затверджено: Ігор, 16.11.2026 (розділи 1–3)
Джерела фактів: знімок до міграції, 15–16.11.2026 – https://claude.ai/artifact/6rLkyT4RzmaECZjdBt6QT2
Робоча копія документа: https://claude.ai/artifact/HqpEwVTu8A8NNJkxNdTxny

Переносимо 4 сторінки `/turkey*` з Tilda на Next.js за тими самими адресами, з оновленими програмами і цінами в USD. Після цього abroad.check-up.in.ua закриваємо 301.

Файли поруч:
- `docs/turkey/programs.json` – 19 програм: назви, ціни, джерело ціни, суть, тривалість, опис, цілі, склад за напрямками, підготовка.
- `docs/turkey/ui-ru.json` – російські підписи інтерфейсу для `/turkey*`.
- `docs/turkey/tilda/*.md` – копії текстів 7 сторінок Tilda (4 `/turkey*` і 3 abroad), знято 15.11.2026.

## 1. Адреси

**Хвиля A – Next.js віддає 4 адреси.** Адреси не змінюються, вмикаються по одній через `lib/seo/approved-routes.json` (Р42).

1. `/turkey/livhospital`
2. `/turkey/acibadem`
3. `/turkey/anadolu`
4. `/turkey` (останньою: хаб посилається на всі три клініки)

Мова хвилі A – російська, як на Tilda. Українська версія `/ukr/turkey*` і hreflang – хвиля C.

**Хвиля B – abroad, 301.** Після того, як хвиля A на проді і показує ціни. DNS abroad.check-up.in.ua → Vercel (робить Ігор), правила за хостом у checkup-main. http і https – однаково.

| abroad | → check-up.in.ua |
| --- | --- |
| `/` | `/turkey` |
| `/ru/clinic/livhospital` | `/turkey/livhospital` |
| `/ru/clinic/livhospital/tproduct/*` (8) | `/turkey/livhospital` |
| `/ru/clinic/anadolumedicalcenter` | `/turkey/anadolu` |
| `/ru/clinic/anadolumedicalcenter/tproduct/*` (5) | `/turkey/anadolu` |
| `/ru/thanks/`, `/page53016105.html`, будь-яка інша | `/turkey` |

**Хвиля C – українська версія.** `/ukr/turkey`, `/ukr/turkey/{livhospital,acibadem,anadolu}`, hreflang uk / ru на обох версіях. Тексти – чат «Контент», затверджує Ігор. Окрема задача, не в цьому PR.

## 2. База: було → стане

Нічого не пишемо до «так» Ігоря на цей розділ. Міграція і DATABASE.md – в одному PR. Стан бази – live 16.11.2026.

**Схема**

- `checkup_programs.currency`: немає → `text NOT NULL DEFAULT 'UAH'`, допустимі UAH / USD / EUR. Наявні 137 рядків отримують UAH, на сайті нічого не змінюється.
- `checkup_programs.details`: немає → `jsonb NULL`: суть одним реченням, тривалість, опис, цілі, підготовка. Склад за напрямками – у наявному `composition`.

**Дані**

- `clinics`: турецьких клінік немає → 3 рядки: `liv-hospital-istanbul`, `acibadem-istanbul`, `anadolu-istanbul`; city `istanbul`, tier `catalog`. `telegram_chat_id` і `notify_email` порожні: заявки йдуть лише в групу «тест бот з лідами».
- `checkup_programs`: 0 → 19 рядків, `program_type = 'clinic'`, `currency = 'USD'`, `price_regular = price_discount`, `price_date = 2026-11-16`. `name_ru` – з джерела, `name_ua` – переклад назви. Значення – з `docs/turkey/programs.json`.

| Клініка | Програма | USD | Джерело ціни |
| --- | --- | --- | --- |
| LIV | Gold, жінки / чоловіки | 3000 / 3000 | abroad = партнер |
| LIV | Silver, жінки / чоловіки | 2200 / 2200 | abroad = партнер |
| LIV | Plus 40+, жінки / чоловіки | 2020 / 2020 | abroad = партнер |
| LIV | Standart, жінки / чоловіки | 1450 / 620 | вища з двох (правило 16.11) |
| LIV | Shape Advanced (кардіо) | 1450 | каталог партнера |
| LIV | Дитячий чекап, від 4 років | 980 | каталог партнера |
| Acibadem | Executive: жінки / чоловіки, до 40 / після 40 (4 рядки) | 3600 кожна | таблиця партнера, за кожен пакет (Ігор, 16.11) |
| Anadolu | Жінки 65+ / чоловіки 65+ | 1935 / 1670 | abroad |
| Anadolu | Чоловіки 40–64 / жінки 40–64 / жінки 18–39 | 1670 / 1140 / 985 | abroad |

Не входять: Acibadem Classic, Gold Man, Gold Woman, Executive MR, Executive Endo-Onko, Pediatric – ціни немає, а запис без ціни не рендериться (Р27).

Склад Acibadem Executive – англійською з таблиці партнера; переклад назв обстежень – [УТОЧНИТИ: потрібен]. До перекладу склад показується як є.

Адреси філій для GEO-блоку (`clinic_branches`): LIV – зі сторінки abroad (Ulus, Beşiktaş); Anadolu – зі сторінки abroad (Gebze); Acibadem – [УТОЧНИТИ: яка філія].

## 3. Сторінки

Компоненти – лише наявні, за docs/ux/ і docs/components-map.md (checkup-platform, dev). Компоненти названо за звіркою чату «Норматив» (нижче).

**Хаб `/turkey`**

1. H1, вступ – текст Tilda `/turkey` (`docs/turkey/tilda/turkey.md`).
2. Три картки клінік з посиланням на `/turkey/{клініка}` (зараз дві ведуть на abroad) і ціною «от {minPrice} USD» з бази.
3. «Как проходит чек-ап за границей» – 5 кроків з abroad (`docs/turkey/tilda/abroad-livhospital.md`).
4. Форма консультації.

**Сторінка клініки `/turkey/{клініка}`**

1. H1, про клініку – текст Tilda цієї сторінки; для LIV і Anadolu – за потреби доповнити блоками abroad (адреса, «Ключевые преимущества»).
2. Програми з бази. Картка: назва, ціна USD, суть, тривалість, кнопка запису. Розкриття (один accordion-патерн): опис, цілі, склад за напрямками, підготовка. Зразок – сторінки програм abroad.
3. Джерела складу: LIV і Anadolu – сторінки програм abroad (13); LIV Shape Advanced і дитячий – каталог партнера; Acibadem Executive – таблиця партнера.
4. «Как проходит чек-ап» – текст Tilda цієї сторінки.
5. GEO-блок – статичний HTML: клініка, Стамбул, адреса.
6. Форма.

**Мова інтерфейсу:** на `/turkey*` кнопки, підписи і форма – російською (Ігор, 16.11). Компоненти отримують підписи через пропи або словник сторінки; тексти підписів – у `docs/turkey/ui-ru.json`. Нових компонентів для цього не створювати.

**SEO на кожній сторінці:** Title і H1 – як на Tilda (знімок, розділ 1), canonical на себе, `lang="ru"`, Schema: MedicalClinic + Offer з `priceCurrency: USD`. Зміна Title і H1 – лише в кроці оптимізації.

**Форми і заявки:** форма – `BookingFlow` + `BookCta` (CM §30.3), не `LeadForm`. POST `/api/leads`, honeypot і consent обов'язкові, `clinic_slug` – клініка сторінки, `source_page` – адреса, програма – у `program_name` як `name_ru`. Посилання згоди – `/ukr/policy`. Telegram – лише група «тест бот з лідами». Полів про здоров'я (хронічні хвороби, скарги) не збираємо.

**Компоненти (звірка НОРМАТИВ, 16.11.2026, ui-kit v1.15, components-map v7.3):** хаб – `LinkRows` (ціна в `line`); програма – `ProgramCard` + `Accordion` (sm, h4) + `BookCta`; 5 кроків – `StageScale`; розділи – `Section`; hero – `Hero` tone dark. Звірка: https://claude.ai/artifact/TTKLi4zzAbB3SE2bctvbim

**Залежності – до них виконавець не стартує:**
1. Чат UX: проп словника підписів у `BookingFlow`, `StickyMobileCta`, `ProgramPicker` (українські значення за замовчуванням).
2. Чат UX: проп валюти в цих трьох компонентах (грн за замовчуванням).
3. Чат UX: рішення про ціну кожної клініки в `LinkRows` на хабі.
4. Чат UX / Library Engineer: копія GEO-блоку (§12) у `components/frame/` з пропами тексту і адрес. До неї – `Section` зі статичним абзацом.

## 4. Порядок робіт

1. Ігор сказав «так» на розділи 1–3 (16.11.2026).
2. Чат ТУРЕЧЧИНА кладе цей документ і файли `docs/turkey/` у репо. Окремий PR у dev, лише документи.
3. Чат «Норматив» звірив розділ 3 з UI-kit (16.11.2026). Чат UX закриває залежності 1–4.
4. Виконавець (окремий чат, Claude Code, Sonnet medium) робить міграцію бази, сторінки і DATABASE.md в одному PR у dev. Адреси в `approved-routes.json` не додає.
5. Чат ТУРЕЧЧИНА перевіряє прев'ю (`?drafts=1`): ціни, склад, Title, H1, canonical, Schema, GEO у View Source, форма.
6. Ігор зливає PR. Потім по одній адресі – додати в `approved-routes.json`, перевірити (200, Title, H1, canonical, форма), далі наступна. Після кожної – SEO Audit Report.
7. Тестова заявка з ім'ям «ТЕСТ» – лише в «тест бот з лідами» (docs/QA-AFTER-DEPLOY.md).
8. Хвиля B (abroad 301) – окремий PR після пункту 6 і DNS від Ігоря.

## 5. НЕ РОБИТИ

- Не змінювати адреси `/turkey*`.
- Не писати тексти самостійно: лише дослівно з `docs/turkey/`. Немає тексту – СТОП.
- Не хардкодити ціни і валюту: лише з бази.
- Не створювати нових компонентів; не вистачає – СТОП, питання чату UX.
- Не додавати адреси в `approved-routes.json` і не чіпати abroad.
- Не надсилати тестові заявки в чати і на пошту клінік.
- Не робити push у main, force push, ручний деплой.

## 6. Звіт виконавця

- Версія цього документа, за якою працював.
- Посилання на PR і прев'ю чотирьох сторінок.
- Перелік файлів і міграцій.
- Кількість програм у базі по клініках (live-запит).
- Що не зроблено і чому.
