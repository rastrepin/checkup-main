# DATABASE.md – checkup-main

Проект Supabase: `apuivrfokciooovrpmgj` (одна база для checkup-main, checkup-platform і medok).
Версія: 2.0 · 27.09.2026 · 5 · НОРМАТИВ. Схему знято з live-бази 27.09.2026 (information_schema, pg_policies, pg_constraint, schema_migrations), використання таблиць – grep коду checkup-main (sprint/kharkiv-v0) і checkup-platform (dev).

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
| quiz_answers | jsonb | | | дані про здоров'я; прибирається A9 (0 рядків із значенням) |
| selected_criteria | text[] | | '{}' | дані про здоров'я; прибирається A9 (2 рядки) |
| recommended_purpose | text | | | дані про здоров'я; прибирається A9 |
| recommended_method | text | | | legacy квізу; у PLATFORM-LINE 7.1 не названо [УТОЧНИТИ: прибирати разом] |

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

### 6.2 Крок 2 – довідник обстежень (Р57). Нічого не ламає

Назви таблиць – від об'єкта «Обстеження» (словник PLATFORM-LINE §8): слова «тест», «скринінг», «позиція» в назвах не вживаються.

```sql
create table public.examinations (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),  -- = /ukr/screening/[slug]
  name_ua text not null,                                 -- назва мовою пацієнта
  gender_scope text not null default 'any' check (gender_scope in ('female', 'male', 'any')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.examination_recommendations (
  id uuid primary key default gen_random_uuid(),
  examination_slug text not null references public.examinations(slug) on update cascade,
  platform_program_id uuid not null references public.platform_programs(id) on delete cascade,  -- стать і вік
  condition_code text not null default 'all',  -- 'all' = для всіх у групі; інакше код фактора
  condition_ua text not null,                  -- «для всіх жінок 40–50», «якщо в сім'ї…»
  periodicity_ua text,
  source_ref text not null,                    -- розділ screening-evidence-matrix і настанова
  reviewed_by text,
  reviewed_at date,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (examination_slug, platform_program_id, condition_code)
);

create table public.clinic_service_examinations (
  clinic_service_id uuid not null references public.clinic_services(id) on delete cascade,
  examination_slug text not null references public.examinations(slug) on update cascade,
  primary key (clinic_service_id, examination_slug)
);

alter table public.examinations enable row level security;
alter table public.examination_recommendations enable row level security;
alter table public.clinic_service_examinations enable row level security;

create policy "Public read examinations" on public.examinations
  for select using (is_active);
-- PLATFORM-LINE 9.1: без рецензента рекомендація не публікується
create policy "Public read reviewed recommendations" on public.examination_recommendations
  for select using (is_active and reviewed_at is not null);
create policy "Public read clinic_service_examinations" on public.clinic_service_examinations
  for select using (true);
```

Правила моделі (обстеження = мета скринінгу, Р21):

- Одне обстеження – один slug, навіть якщо методів кілька. `pap-test` закривають і ПАП-тест, і тест на ВПЛ: обидві послуги зв'язуються з `pap-test`.
- Обстеження закрите програмою, якщо хоча б одна послуга програми зв'язана з ним:
  `exists (program_services ps join clinic_service_examinations cse using (clinic_service_id) where ps.checkup_program_id = :program and cse.examination_slug = :exam)`.
- Рівень показників (Р34) на етапі 1 не будується. Послуга зв'язується з обстеженням напряму, пакет – з кожним обстеженням, яке він закриває.
- План будується лише з `examination_recommendations`. Статуси Р36 («обов'язковий / зайвий») не є джерелом плану і в інтерфейс не потрапляють.
- Групи плану етапу 1 обчислюються, а не зберігаються:
  - «Головне зараз» – `condition_code = 'all'` і в місті є активна послуга клініки, зв'язана з обстеженням;
  - «Запитати у лікаря» – усе інше.
- «Додати до запису» – послуги клініки (`is_active`, не `is_service_position`), зв'язані з обстеженням з плану, якого немає в обраній програмі.

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

### 6.6 Крок 6 – наповнення (після A8, рецензія матриці)

1. `examinations` – обстеження з screening-evidence-matrix для 8 вікових груп. Slug збігається з наявними сторінками довідника: `mamografiia`, `pap-test`, `psa`.
2. `examination_recommendations` – лише з рядків матриці з ПІБ і датою рецензента. Рядки чоловічих груп – після рішення PLATFORM-LINE 9.2.8.
3. `clinic_service_examinations` – для 43 послуг ОН Клінік Харків. Послуга, що не закриває жодного обстеження, лишається без зв'язку. Вона не надлишок у тексті, а просто поза планом (Р53).

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
-- 5: кожна вікова сторінка Харкова має хоча б одну рекомендацію 'all'
select pp.slug, count(*) from examination_recommendations r
join platform_programs pp on pp.id = r.platform_program_id
where r.condition_code = 'all' and r.reviewed_at is not null group by pp.slug;
-- 6: після кроку 5 колонок здоров'я в leads немає
```

Відкат: кроки 1–4 оборотні (drop нових таблиць і колонок, повернення політик). Крок 5 – ні.

---

## 7. Історія

- 2.0 · 27.09.2026 – файл перебудовано за live-схемою: карта 26 таблиць з власниками, деталі таблиць основного домену і спільних, контракт A9. Виправлено застарілі твердження 1.0 (`clinic_services.price` nullable з 30.08; `program_services` наповнено; кількість рядків).
- 1.0 · 09.08.2026 – checkup_programs.program_type і price_date, clinic_services, program_services, 6 оферів (Р29). Фактичні дати міграцій у базі – 15.08.2026.

Останні міграції live: add_booking_status_to_doctors, add_is_active_to_doctor_services (08.09); seed_program_services_zhinochyi_profilaktychnyi, seed_program_services_zhinochyi_pislya_40, seed_clinic_services_zhinochyi_pislya_40_composition, make_clinic_services_price_nullable (30.08); drop_leads_clinic_id_hard_fk (27.08).
