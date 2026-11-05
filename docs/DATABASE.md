# DATABASE.md – checkup-main

Проект Supabase: `apuivrfokciooovrpmgj` (одна база для checkup-main, checkup-platform і medok).
Версія: 2.1.1 · 05.11.2026 · 5 · НОРМАТИВ (§6.2 – порожній min_age не потрапляє в «Додати дослідження»). Попередня: 2.1 · 04.11.2026 (§1 – 4 таблиці кроку 2 A9; §6.2 – нова редакція під «Мій план»; §6.6, §6.7). Попередня: 2.0 · 27.09.2026. Схему знято з live-бази 27.09.2026 (information_schema, pg_policies, pg_constraint, schema_migrations), використання таблиць – grep коду checkup-main (sprint/kharkiv-v0) і checkup-platform (dev).

Файл – довідник, не джерело правди. Перед міграцією або запитом, що спирається на структуру, звіряти live-схему через Supabase MCP.

## Де що канонічне

- Цей файл – канон для карти всіх таблиць (розділ 1) і для деталей таблиць основного домену та спільних таблиць (розділи 2–3).
- `checkup-platform/docs/DATABASE.md` лишається каноном деталей таблиць субдоменного конвеєра (розділ 4). Він не замінюється вказівником: правило «міграція і DATABASE.md в одному PR» неможливо виконати між двома репо, а субдоменні міграції робляться з checkup-platform.
- Хто змінює таблицю, оновлює файл свого репо в тому ж PR, що і міграцію. Нова таблиця або зміна власника – рядок у розділі 1 цього файлу окремим PR.

---

## 1. Карта таблиць (26, live 27.09.2026)

| Таблиця | Власник | Пише | Читає | Рядків | RLS | Деталі |
|---|---|---|---|---|---|---|
| leads | checkup-main | /api/leads; legacy прямі вставки з браузера (2.1) | – | 2 | insert public; select anon – усі рядки (2.1) | 2.1 |
| checkup_programs | checkup-main | міграції | checkup-main | 35 | read public | 2.2 |
| platform_programs | checkup-main | міграції | checkup-main | 15 | read public | 2.3 |
| platform_program_offers | checkup-main | міграції | checkup-main | 41 | read public | 2.3 |
| clinic_services | checkup-main | міграції | checkup-main | 43 | read public | 2.4 |
| program_services | checkup-main | міграції | checkup-main | 64 | read public | 2.4 |
| examinations | checkup-main | Ігор (Table Editor); міграції | checkup-main | 0 | read public (is_active) | 6.2 |
| risk_factors | checkup-main | Ігор (Table Editor) | checkup-main | 0 | read public (is_active) | 6.2 |
| examination_recommendations | checkup-main | Ігор (Table Editor) | checkup-main | 0 | read public (is_active і reviewed_at) | 6.2 |
| clinic_service_examinations | checkup-main | Ігор (Table Editor) | checkup-main | 0 | read public | 6.2 |
| patient_criteria | заморожений квіз (Р40, Р48) | не знайдено | не знайдено | 0 | insert public | 2.5 |
| quiz_configs | заморожений квіз | не знайдено | не знайдено | 2 | read public (is_active) | 2.5 |
| clinics | спільна | міграції обох репо | обидва репо | 33 | read public (is_active) | 3.1 |
| clinic_branches | спільна | міграції | обидва репо | 10 | read public | 3.2 |
| onclinic_leads | checkup-platform | /api/leads/onclinic | CRM | 44 | insert public і service_role; select, update – service_role | 4 |
| ccrm_leads | checkup-platform | /api/leads/tilda (вебхук Tilda) | CRM | 29 | insert public | 4 |
| services | checkup-platform | міграції | checkup-platform | 34 | read public | 4 |
| service_map | checkup-platform | міграції | checkup-platform | 3 | read public | 4 |
| doctors | checkup-platform | міграції | checkup-platform | 17 | read public | 4 |
| doctor_services | checkup-platform | міграції | checkup-platform | 66 | read public | 4 |
| doctor_schedule_template | checkup-platform | міграції | checkup-platform | 96 | read public | 4 |
| consultation_prices | checkup-platform | міграції | checkup-platform | 8 | read public | 4 |
| provider_criteria_data | [УТОЧНИТИ: власник] | не знайдено | не знайдено | 16 | read public | 4 |
| programs | [УТОЧНИТИ: власник] | не знайдено | не знайдено | 371 | read public (is_active) | 4 |
| medok_leads | medok | medok-web | – | 23 | insert public | 5 |
| medok_cabinets | medok | medok-web | medok-web | 19 | select, insert, update – public (5) | 5 |
| medok_doctors | medok | – | medok-web | 5 | read public | 5 |
| medok_doctor_specializations | medok | – | medok-web | 5 | read public | 5 |
| medok_programs | medok | – | medok-web | 4 | read public | 5 |
| medok_quiz_events | medok | medok-web | service_role | 219 | insert anon | 5 |

«Не знайдено» – у коді checkup-main і checkup-platform звернень немає (grep 27.09); можливі читачі поза цими репо.

Ключ Supabase у checkup-main: лише анонімний (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, lib/supabase.ts), зокрема і в серверному /api/leads. Тому все, що пише checkup-main, спирається на публічні RLS-політики. Контракт A9 (розділ 6) це змінює.

---

## 2. Таблиці основного домену

### 2.1 leads

Заявки з нових сторінок основного домену. PLATFORM-LINE 7.1: лише дані запису, без даних про здоров'я.

| Поле | Тип | Null | Default | Статус |
|---|---|---|---|---|
| id | uuid | NN | gen_random_uuid() | |
| city | text | NN | | |
| clinic_slug | text | | | |
| clinic_id | uuid | | | без FK (міграція drop_leads_clinic_id_hard_fk) |
| source_page | text | NN | | |
| source_cta | text | | | |
| session_id | text | | | |
| name | text | NN | | ПД |
| phone | text | NN | | ПД |
| preferred_contact | text | | | пише /api/leads |
| preferred_contact_method | varchar | | 'call' | не пише жоден поточний код |
| preferred_shift, preferred_call_time | text | | | не пише жоден поточний код |
| selected_program_slug, program_name | text | | | дані запису |
| price | integer | | | снепшот ціни |
| selected_branch_id | uuid | | | |
| branch_address, selected_date_label | text | | | |
| selected_date | date | | | |
| preferred_doctor | text | | | |
| comment | text | | | зараз сюди йде «Додатково цікавить» (рішення Cowork 29.08); після A9 – лише вільний текст |
| consent_given | boolean | | false | |
| consent_given_at | timestamptz | | | |
| status | text | | 'new' | |
| created_at | timestamptz | | now() | |
| utm_source, utm_medium, utm_campaign | text | | | |

RLS live: `Public insert leads` (INSERT, public, WITH true); `leads_select_by_id` (SELECT, anon, USING true). Друга політика, попри назву, відкриває анонімному ключу всі рядки з іменами і телефонами. Прибирається першим кроком A9.

Хто пише:

- `app/api/leads/route.ts` – єдиний чинний шлях (форма `components/city/BookingFlow.tsx` на сторінках Харкова). Insert без `.select()`.
- Legacy, пряма вставка з браузера, лише на незатверджених сторінках (на домені їх віддає Tilda, Р42): `components/program-page/BookingModal.tsx` (insert + select id), `components/quiz/ContactForm.tsx` (пише quiz_answers, insert + select id, редірект на неіснуючий /cabinet/preview), `components/shared/LeadForm.tsx` (пише колонки, яких у таблиці немає, – вже не працює).

### 2.2 checkup_programs

Програми клінік (`program_type = 'clinic'`) і заморожені сервісні (`'standard'`, Р39).

| Поле | Тип | Null | Примітка |
|---|---|---|---|
| id | uuid | NN | |
| clinic_id | uuid | | FK clinics |
| slug | text | NN | unique (clinic_id, slug) |
| name_ua, name_ru | text | NN | назва – дослівно з прайсу клініки |
| gender, age_group | text | | legacy-поля одиничної прив'язки; сторінки читають через platform_program_offers |
| price_regular, price_discount | integer | NN | |
| consultations_count, analyses_count, diagnostics_count | integer | | |
| composition | jsonb | NN | legacy-склад; канон складу – program_services |
| is_specialized | boolean | | false |
| is_active | boolean | | true |
| sort_order | integer | | 0 |
| standard_slug | text | | |
| program_type | text | | `clinic` / `standard` |
| price_date | date | | без дати запис не рендериться (Р27) |

Фільтр читання на платформі: `program_type = 'clinic'`.

### 2.3 platform_programs, platform_program_offers

`platform_programs` – сторінки платформи за статтю і віком (15 рядків). Коди `age_group` у базі: `do-30`, `30-40`, `40-50`, `50+`, `any`. Мапа URL-слаг ↔ slug бази – SEO-STANDARD §1; за Р49 URL `do-40-rokiv` відповідає `female-checkup-30-40` / `male-checkup-30-40`, slug бази не змінюється.

| Поле | Тип | Null |
|---|---|---|
| id | uuid | NN |
| slug | text | NN, unique |
| name_ua | text | NN |
| gender | text | |
| age_group | text | |
| is_specialized | boolean | |
| sort_order | integer | |
| created_at | timestamptz | |

`platform_program_offers`: id, platform_program_id (FK, CASCADE), checkup_program_id (FK, CASCADE), sort_order; unique (platform_program_id, checkup_program_id).

### 2.4 clinic_services, program_services

`clinic_services` – послуга клініки (PLATFORM-LINE §8, Р35): позиція прайсу рівня клініка × місто.

| Поле | Тип | Null | Примітка |
|---|---|---|---|
| id | uuid | NN | |
| clinic_id | uuid | | FK clinics |
| city | text | | |
| code | text | | код номенклатури клініки; null, якщо немає |
| name_ua | text | NN | як у рахунку |
| service_type | text | NN | `consultation` / `lab` / `instrumental` |
| price | numeric | | nullable з 30.08 (міграція make_clinic_services_price_nullable); live: ціна є в 10 з 43 |
| price_type | text | NN | `exact` / `from` |
| price_date | date | NN | |
| discount_percent | numeric | | |
| is_complex | boolean | NN | пакет з кількох показників |
| complex_content | text | | |
| is_service_position | boolean | NN | забір матеріалу, пацієнту не показується |
| is_active | boolean | NN | |
| created_at | timestamptz | | |

`program_services` – склад програми: id, checkup_program_id (FK, CASCADE), clinic_service_id (FK), quantity (NN, 1), visit_number, price_override, created_at. Live: 64 рядки для програм ОН Клінік Харків.

### 2.5 patient_criteria, quiz_configs

Активи замороженого квізу. `patient_criteria`: 0 рядків; CHECK `source_lead_table in ('onclinic_leads','medok_leads','leads')`. `quiz_configs`: 2 рядки. Жоден репо їх не пише і не читає. За PLATFORM-LINE 7.1 зв'язок з `leads` прибирається (A9).

---

## 3. Спільні таблиці

### 3.1 clinics

id, name (NN), slug (NN, unique), city (NN, default 'kyiv'), district, district_tag, addresses (jsonb), tier (NN: premium / catalog / paused), discount_percent, logo_url, phone, website, is_active (NN), created_at, updated_at, telegram_chat_id, notify_email.

`phone` – джерело номера для «Показати номер», якщо у філії немає `tracking_phone` (SEO-STANDARD 1.4, §6). Live 27.09: у onclinic-kharkiv порожній.
`telegram_chat_id`, `notify_email` – читає checkup-platform (lib/clinic-notify.ts); checkup-main маршрутизує Telegram через env.

### 3.2 clinic_branches

id, clinic_id (FK clinics), name_ua, name_ru, address_ua, address_ru (NN), metro_ua, metro_ru, schedule (jsonb NN), lat, lng, sort_order, city, slug (unique), tracking_phone.

---

## 4. Таблиці субдоменного конвеєра

Деталі – `checkup-platform/docs/DATABASE.md`. Стан 27.09: той файл описує лише `onclinic_leads` і знятий 16.06 (47 колонок; live – 52, бракує pricing_model, clinic_slug, email_sent, email_sent_at, email_error, quoted_price). Оновлення – у конвеєрі субдомену.

Для основного домену важливе:

- `onclinic_leads` містить `birthdate`, `case_slug`, `consultation_intent`, `quiz_answers` у `analytics` разом з ім'ям і телефоном. Це шар C, поза PLATFORM-LINE 7.1.
- `ccrm_leads` – ліди Tilda; виняток MVP (PLATFORM-LINE 7.1) завершується переходом форм міста на /api/leads.

---

## 5. medok

Окремий проект, лише облік. Live 27.09: `medok_cabinets` має політики `read_cabinet_by_uuid` (SELECT public, USING true) і `update_cabinets` (UPDATE public, USING true). Анонімний ключ читає і змінює всі кабінети: ім'я, телефон, тиждень вагітності, нотатки. Передано власнику проекту.

---

## 6. Контракт міграції A9 (етап 1 Харкова)

Підстави: PLATFORM-LINE 1.2.1 (3.7, 4.7, 6.2, 7.1, 8), Р46, Р47, Р52, Р57.
Виконавець: КОД за задачею Координатора. Кожен крок – окрема міграція (apply_migration) з оновленням цього файлу в тому ж PR.
Таблиці checkup-platform і medok контракт не змінює.

### 6.1 Крок 1 – безпека і нові поля. Нічого не ламає

```sql
-- анонімний SELECT усіх лідів
drop policy "leads_select_by_id" on public.leads;

alter table public.leads
  add column variant smallint check (variant in (1, 2, 3)),
  add column entry_point text check (entry_point in ('page', 'quiz', 'search')),
  add column added_service_ids uuid[] not null default '{}';
```

`added_service_ids` – id з `clinic_services`, а не `code`: код клініки часто null. У повідомленні КЦ – назва і код з `clinic_services`.

Наслідок: legacy BookingModal і ContactForm (insert + select) перестають працювати. Вони лише на незатверджених сторінках; чинна форма BookingFlow → /api/leads не зачеплена.

### 6.2 Крок 2 – довідник обстежень, Базовий план, ризик-флоу, ціни (Р57, «Мій план»). Нічого не ламає

Редакція 2.1 (04.11.2026) – під специфікацію `docs/ux/specs/2026-11-my-plan.md` v0.2 (checkup-platform dev, PR #192) і задачу UX → Нормативу від 04.11. Замінює редакцію 2.0: рівня «Повний план» і `condition_code` немає (рішення Ігоря 04.11); ризик-рядки – через `risk_factor_code`; групу «стать × вік» задає `platform_program_slug` (текстовий ключ – щоб Ігор вносив дані без uuid).

Назви таблиць – від об'єкта «Обстеження» (словник PLATFORM-LINE §8): слова «тест», «скринінг», «позиція» в назвах не вживаються.

```sql
-- 1. Довідник обстежень
create table public.examinations (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),          -- = /ukr/screening/[slug]
  name_ua text not null,                                         -- назва мовою пацієнта
  gender_scope text not null default 'any'
    check (gender_scope in ('female', 'male', 'any')),
  min_age smallint check (min_age between 0 and 120),            -- фільтр «Додати дослідження»; null – без обмеження
  purpose_ua text check (char_length(purpose_ua) <= 80),         -- «для чого», рядок картки
  rationale_type text
    check (rationale_type in ('guideline', 'know_your_norm', 'doctor')),
  rationale_ua text check (char_length(rationale_ua) <= 160),    -- обґрунтування, 1–2 речення
  source_ref text,                                               -- назва джерела для позначки «Настанова · {джерело}»
  harm_ua text check (char_length(harm_ua) <= 300),              -- зворот картки; null – картка не перегортається
  harm_reviewed_at date,                                         -- без дати текст шкоди не показується
  included_in_slug text references public.examinations(slug) on update cascade,
                                                                 -- входить в інше (тиск → консультація): без ціни, без «Не потрібно»
  offer_as_extra boolean not null default true,                  -- false – лише Базовий план і ризик-флоу, не «Додати дослідження»
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (included_in_slug is null or included_in_slug <> slug)
);

-- 2. Фактори ризику (чипи ризик-флоу)
create table public.risk_factors (
  code text primary key check (code ~ '^[a-z0-9-]+$'),
  name_ua text not null check (char_length(name_ua) <= 60),
  gender_scope text not null default 'any'
    check (gender_scope in ('female', 'male', 'any')),
  min_age smallint check (min_age between 0 and 120),
  max_age smallint check (max_age between 0 and 120),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (min_age is null or max_age is null or min_age <= max_age)
);

-- 3. Склад Базового плану і ризик-флоу для групи «стать × вік»
create table public.examination_recommendations (
  id uuid primary key default gen_random_uuid(),
  examination_slug text not null
    references public.examinations(slug) on update cascade on delete cascade,
  platform_program_slug text not null
    references public.platform_programs(slug) on update cascade,  -- female-checkup-30-40 тощо
  risk_factor_code text
    references public.risk_factors(code) on update cascade,        -- null – Базовий план; заповнений – ризик-флоу
  condition_ua text,                                               -- як бачить людина: «Раз на 3 роки», «З 35 років»
  periodicity_ua text,
  locked boolean not null default false,                           -- рядок без «Не потрібно» (консультація)
  source_ref text not null,                                        -- джерело рядка: наказ, настанова, розділ матриці
  reviewed_by text,
  reviewed_at date,                                                -- без дати рядок не читається публічно (PLATFORM-LINE 9.1)
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (reviewed_at is null or reviewed_by is not null),
  check (risk_factor_code is null or not locked),
  unique nulls not distinct (examination_slug, platform_program_slug, risk_factor_code)
);
create index examination_recommendations_program_idx
  on public.examination_recommendations (platform_program_slug);

-- 4. Послуга клініки ↔ обстеження
create table public.clinic_service_examinations (
  clinic_service_id uuid not null
    references public.clinic_services(id) on delete cascade,
  examination_slug text not null
    references public.examinations(slug) on update cascade on delete cascade,
  in_price boolean not null default true,   -- послуга входить у ціну обстеження в цій клініці
  created_at timestamptz not null default now(),
  primary key (clinic_service_id, examination_slug)
);
create index clinic_service_examinations_exam_idx
  on public.clinic_service_examinations (examination_slug);

alter table public.examinations enable row level security;
alter table public.risk_factors enable row level security;
alter table public.examination_recommendations enable row level security;
alter table public.clinic_service_examinations enable row level security;

create policy "Public read examinations" on public.examinations
  for select using (is_active);
create policy "Public read risk_factors" on public.risk_factors
  for select using (is_active);
-- PLATFORM-LINE 9.1: без рецензента рядок плану не публікується
create policy "Public read reviewed recommendations" on public.examination_recommendations
  for select using (is_active and reviewed_at is not null);
create policy "Public read clinic_service_examinations" on public.clinic_service_examinations
  for select using (true);
-- Запис – лише власником проєкту (Table Editor Supabase) і міграціями. Політик insert/update немає.
```

Відкат: `drop table` чотирьох таблиць у зворотному порядку (4, 3, 2, 1). Інших таблиць крок не змінює.

#### Правила моделі (обстеження = мета скринінгу, Р21)

- Одне обстеження – один slug, навіть якщо методів кілька. `pap-test` закривають і ПАП-тест, і тест на ВПЛ.
- Рівень показників (Р34) не будується. Послуга зв'язується з обстеженням напряму; пакет – з кожним обстеженням, яке він закриває.
- Межі вікових груп (для `min_age` і факторів ризику): `do-30` – 18–29; `30-40` – 30–39; `40-50` – 40–49; `50+` – від 50. Мапа – у коді (константа поруч з мапою URL-слаг ↔ slug, Р12), не в базі.

Базовий план групи (my-plan §3):
- рядки `examination_recommendations` з `platform_program_slug` групи і `risk_factor_code is null`, публічні (переглянуті), за `sort_order`;
- `locked` – «Завжди», без «Не потрібно»;
- обстеження з `included_in_slug` – «У консультації», без ціни і без «Не потрібно»;
- блоку немає, якщо в групи немає жодного публічного рядка Базового плану.

«Додати дослідження» (my-plan §6) – обстеження, у яких одночасно:
- `is_active` і `offer_as_extra`;
- `gender_scope` = стать сторінки або `any`;
- `min_age` заповнений і ≤ нижньої межі групи; порожній `min_age` – обстеження в «Додати дослідження» не з'являється (захист від помилки в даних, my-plan v0.5 §6); у Базовому плані і ризик-флоу воно лишається;
- немає в Базовому плані групи;
- є ціна хоча б в одній клініці міста (правило ціни нижче).

Ризик-флоу (my-plan §7):
- чип фактора показується, якщо `gender_scope` збігається, вікові межі фактора перетинаються з групою і для групи є хоча б один публічний рядок з цим `risk_factor_code`;
- картки під обраними чипами – обстеження з цих рядків; одне обстеження – одна картка.
- Фактор ризику живе лише в хеші посилання на план. У базу, аналітику і заявку не потрапляє (PLATFORM-LINE 7.1).

Ціна обстеження в клініці (my-plan §5, правило `price_rule` з брифу):
- беруться зв'язки `clinic_service_examinations` з `in_price = true` до активних послуг цієї клініки (`clinic_services.clinic_id`);
- ціна обстеження = сума `clinic_services.price` цих послуг;
- «комплекс клініки» – зв'язати комплекс з `in_price = true`, окремі позиції не зв'язувати або зв'язати з `false`;
- «сума окремих позицій» – зв'язати кожну позицію з `in_price = true`;
- альтернатива (ПАП-тест або тест на ВПЛ) – основна послуга `true`, інша `false`;
- зв'язків з `in_price = true` немає – «Немає в {клініка}»;
- хоча б одна з цих послуг без ціни або з `price_type = 'from'` – ціни немає (Р27: ціна лише точна);
- обстеження з `included_in_slug` ціни не має і в суму не входить;
- знижка (`clinic_services.discount_percent`) не застосовується: ціна – повна за прайсом.

Сума плану в клініці:
- послуги всіх обраних обстежень без повторів: пакет, що закриває два обстеження, рахується один раз;
- дата під сумою – найстаріша `price_date` серед цих послуг;
- обстеження без ціни в клініці – у суму не входить, рядок «Не входить у суму» (за замовчуванням my-plan §12 п. 2).

Клініки у виборі (my-plan §2): клініки міста з конфігурації міста (`lib/cities/checkup-cities.ts`, порядок – PLATFORM-LINE 2.2), у яких є ціна хоча б одного обстеження плану.

Заявка «Записатися за цим планом» (my-plan §5, Р47, Р52, Р60):
- `leads.clinic_slug`, `leads.added_service_ids` – id послуг з правила суми, `leads.price` – сума, `leads.variant = 2`;
- без назви плану, без прибраних рядків, без факторів ризику, без позначки «додаткове / за фактором ризику».

Що вносить Ігор (Table Editor Supabase, без SQL; інструкція – `docs/MY-PLAN-DATA-ENTRY.md`):
- `clinic_services` клінік міста з прайсу з датою;
- `examinations`, `risk_factors`, `examination_recommendations`, `clinic_service_examinations`;
- `reviewed_by`, `reviewed_at` – Ігор, після погодження з лікарем офлайн. Інших підтверджень немає.

### 6.3 Крок 3 – план пацієнта. Потребує ключа service_role

```sql
create table public.patient_plans (
  id uuid primary key default gen_random_uuid(),   -- UUIDv4, адреса /p/[id]
  created_on date not null default current_date,   -- дата, не час
  platform_program_id uuid references public.platform_programs(id),
  city text,
  variant smallint check (variant in (1, 2, 3)),
  entry_point text check (entry_point in ('page', 'quiz', 'search')),
  items jsonb not null default '[]',
  -- [{ "examination_slug": "...", "group": "main" | "ask_doctor", "accepted": true }]
  booking_summary jsonb,
  -- null після «Зберегти план»; після форми:
  -- { "clinic_slug", "program_slug", "program_name", "added_services": [{ "id", "name_ua" }] }
  booking_status text check (booking_status in ('created', 'confirmed')),
  booking_status_source text check (booking_status_source in ('integration', 'patient'))
);

alter table public.patient_plans enable row level security;
-- політик немає: читання і запис лише серверним кодом з service_role
```

Межа «не разом» (PLATFORM-LINE 7.1). У `patient_plans` ніколи не з'являються:

- ім'я, телефон, email, дата народження;
- `lead_id`, `session_id`, UTM, `ga_client_id`, `source_cta`;
- точний час.

У `leads` ніколи не з'являється id плану. Без цього платформа не може зіставити план і лід. Рядки лідів і планів одного дня з однієї сторінки теоретично зіставні за датою і містом – залишковий ризик, названий свідомо.

Аналітика (передати в N3):
- у GA4 шлях /p/[id] передається як `/p/`, без id;
- id ліда в GA4 не передається.

### 6.4 Крок 4 – серверний ключ і закриття прямих вставок

Порядок обов'язковий, інакше форма впаде:

1. Ігор: `SUPABASE_SERVICE_ROLE_KEY` у Vercel checkup-main (Preview і Production, без префікса NEXT_PUBLIC). Та сама назва, що в checkup-platform.
2. КОД: серверний клієнт з service_role у lib (лише для route handlers і server components). /api/leads, endpoint «Зберегти план» і /p/[id] працюють через нього.
3. Деплой і тестова заявка з прев'ю: рядок у `leads`.
4. Лише після п.3:

```sql
drop policy "Public insert leads" on public.leads;
```

Після цього писати в `leads` можна лише через /api/leads (honeypot і consent не обійти прямою вставкою з браузера).

### 6.5 Крок 5 – прибрати дані про здоров'я з leads (до публікації Харкова)

Виконано 29.09.2026 разом з recommended_method (рішення Ігоря 27.09), до кроків 3–4 (рішення Координатора: /api/leads у ці колонки не пише).

Умова: кроки 1–4 виконано; у коді затверджених сторінок немає записів у ці колонки (grep).

```sql
alter table public.leads
  drop column quiz_answers,
  drop column selected_criteria,
  drop column recommended_purpose;

alter table public.patient_criteria
  drop constraint patient_criteria_source_lead_table_check,
  add constraint patient_criteria_source_lead_table_check
    check (source_lead_table in ('onclinic_leads', 'medok_leads'));
```

Незворотно. Live 27.09: quiz_answers – 0 рядків зі значенням, selected_criteria – 2 рядки, patient_criteria – 0. Legacy ContactForm (заморожений квіз) після цього не працює – він і так недоступний на домені.
Ім'я constraint – звірити live перед виконанням.

### 6.6 Крок 6 – наповнення (Ігор, з 05.11.2026)

Дані вносить Ігор у Table Editor Supabase (інструкція – `docs/MY-PLAN-DATA-ENTRY.md`). Виконавці записів складу і цін замість Ігоря не роблять (задача UX → Нормативу 04.11, §2).

1. `clinic_services` – послуги клінік міста з прайсу з датою. Перше місто – Ужгород (live 04.11: 0 рядків).
2. `examinations` – обстеження зі сторінок вікових груп і screening-evidence-matrix. Slug збігається з наявними сторінками довідника: `mamografiia`, `pap-test`, `psa`.
3. `risk_factors`, `examination_recommendations` – рядки з `reviewed_by` і `reviewed_at` після погодження з лікарем.
4. `clinic_service_examinations` – зв'язок послуг з обстеженнями. Послуга, що не закриває жодного обстеження, лишається без зв'язку (Р53).

Чернетка складу – `content/plans/*.md`. Шаблон сторінки її не читає (my-plan §1.4 задачі).

### 6.7 Перевірка (Координатор, інструментом)

```sql
-- 1: анонімний select на leads зник
select policyname from pg_policies where tablename = 'leads';
-- 2: нові поля
select column_name from information_schema.columns
where table_name = 'leads' and column_name in ('variant', 'entry_point', 'added_service_ids');
-- 3: у плані немає ПД і зв'язку з лідом
select column_name from information_schema.columns where table_name = 'patient_plans';
-- 4: публічно видно лише рецензовані рекомендації (запит анонімним ключем)
-- 5: групи, у яких є публічний Базовий план
select platform_program_slug, count(*) from examination_recommendations
where risk_factor_code is null and is_active and reviewed_at is not null
group by platform_program_slug;
-- 5а: таблиці кроку 2 і RLS
select tablename, policyname from pg_policies
where tablename in ('examinations', 'risk_factors', 'examination_recommendations', 'clinic_service_examinations');
-- 6: після кроку 5 колонок здоров'я в leads немає
```

Відкат: кроки 1–4 оборотні (drop нових таблиць і колонок, повернення політик). Крок 5 – ні.

---

## 7. Історія

- 2.1.1 · 05.11.2026 – §6.2, «Додати дослідження»: обстеження з порожнім `min_age` не показується (my-plan v0.5 §6, рішення Ігоря 05.11).
- 2.1 · 04.11.2026 – крок 2 A9 у новій редакції під `docs/ux/specs/2026-11-my-plan.md` v0.2: `examinations` з полями картки (min_age, purpose_ua, rationale_type, rationale_ua, source_ref, harm_ua, harm_reviewed_at, included_in_slug, offer_as_extra); нова `risk_factors`; `examination_recommendations` – `platform_program_slug`, `risk_factor_code`, `locked` замість `platform_program_id` і `condition_code`; `clinic_service_examinations.in_price` – правило ціни; правила Базового плану, «Додати дослідження», ризик-флоу, ціни і заявки; крок 6 – наповнює Ігор. Чернетка 2.1 від 30.09 у dev не потрапила, її зміни тут не відтворено.
- 2.0 · 27.09.2026 – файл перебудовано за live-схемою: карта 26 таблиць з власниками, деталі таблиць основного домену і спільних, контракт A9. Виправлено застарілі твердження 1.0 (`clinic_services.price` nullable з 30.08; `program_services` наповнено; кількість рядків).
- 1.0 · 09.08.2026 – checkup_programs.program_type і price_date, clinic_services, program_services, 6 оферів (Р29). Фактичні дати міграцій у базі – 15.08.2026.

Останні міграції live: my_plan_step2_examinations (04.11: крок 2 A9 – `examinations`, `risk_factors`, `examination_recommendations`, `clinic_service_examinations`, RLS і 4 політики читання, SQL §6.2 дослівно); add_photo_card_url_to_doctors (21.10: `doctors.photo_card_url` – кадр картки лікаря на check-up.in.ua, `public/assets/doctors/cards/`, генерує `scripts/doctor-card-photo.py`; читає `lib/hub/prolaps-offers.ts`); add_booking_status_to_doctors, add_is_active_to_doctor_services (08.09); seed_program_services_zhinochyi_profilaktychnyi, seed_program_services_zhinochyi_pislya_40, seed_clinic_services_zhinochyi_pislya_40_composition, make_clinic_services_price_nullable (30.08); drop_leads_clinic_id_hard_fk (27.08).
