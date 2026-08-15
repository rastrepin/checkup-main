# DATABASE.md — checkup-main

Проект Supabase: `apuivrfokciooovrpmgj`.

Цей файл — довідник по схемі, не джерело правди. Перед будь-якою міграцією або запитом, що спирається на структуру, звіряти живу схему через Supabase MCP (`list_tables`), а не цей документ.

Версія: 1.0 · 09.08.2026 · створено в рамках `task-cowork-01-migration.md`.

---

## checkup_programs

Програми клінік (реальні, продані клінікою) і сервісні програми (зібрані платформою, тепер заморожені).

Нові поля (09.08.2026):

| Поле | Тип | Опис |
|---|---|---|
| `program_type` | text | `clinic` — реальна програма клініки. `standard` — сервісна програма, зібрана платформою, заморожена рішенням Ігоря 09.08.2026. Заповнено з `composition->>'program_type'`; порожні (Онклінік) → `clinic`. Поле в `composition` залишено, не видалене — видалення окремим кроком після переведення читання на колонку |
| `price_date` | date | Дата, на яку ціна актуальна = дата отримання інформації від клініки. Обов'язкове за Р27: запис без `price_date` не рендериться і не потрапляє в sitemap. NOT NULL навмисно не проставлено — частина рядків не має дати, блокування вставки зламало б наявні процеси. Обов'язковість — на рівні читання, не схеми |

Стан на 09.08.2026: `program_type` — `clinic` 11 рядків, `standard` 24 рядки, null немає. `price_date` заповнено для 4 профілактичних програм Онклінік Харків (`zhinochyi-profilaktychnyi`, `zhinochyi-pislya-40`, `cholovichyi-profilaktychnyi`, `cholovichyi-pislia-40`) = `2026-08-09`, решта — null.

Фільтр читання карток на платформі (актуальний, після міграції):

```sql
where cp.program_type = 'clinic'
```

## clinic_services

Довідник послуг клініки — окремих позицій, з яких складаються програми, і які пропонуються як доповнення на вікових сторінках (блок 5 Типу 5a).

| Поле | Тип | Nullable | Опис |
|---|---|---|---|
| `id` | uuid pk | no | |
| `clinic_id` | uuid fk → clinics | yes | |
| `city` | text | yes | ціна належить парі клініка × місто |
| `code` | text | yes | код номенклатури клініки. Без коду — null, не рядок-заглушка |
| `name_ua` | text | no | назва як у рахунку пацієнта |
| `service_type` | text | no | `consultation` / `lab` / `instrumental` |
| `price` | numeric | no | |
| `price_type` | text | no | `exact` / `from`. `from` — лише коли обсяг послуги невизначений до виконання (приклад: колоноскопія). НЕ для приховування застарілої ціни — свіжість позначається `price_date`, не `from` |
| `price_date` | date | no | обов'язкове завжди, на відміну від `checkup_programs.price_date` |
| `discount_percent` | numeric | yes | знижка у складі чекапу |
| `is_complex` | boolean | no | позиція містить кілька показників (пакет) |
| `complex_content` | text | yes | перелік показників для комплексних позицій |
| `is_service_position` | boolean | no | забір крові, забір матеріалу — не показується пацієнту, але входить у ціну |
| `is_active` | boolean | no | |

RLS: public read (`USING (true)`).

Наповнено 09.08.2026: 10 рядків, `onclinic-kharkiv`, `city='kharkiv'`, `price_date='2026-08-09'` (відповідь клініки від тієї ж дати). Коди без номенклатури (`[УТОЧНИТИ]` у джерелі) — `code = null`.

## program_services

Зв'язок програми клініки зі складом (`clinic_services`).

| Поле | Тип | Nullable | Опис |
|---|---|---|---|
| `id` | uuid pk | no | |
| `checkup_program_id` | uuid fk → checkup_programs | yes | ON DELETE CASCADE |
| `clinic_service_id` | uuid fk → clinic_services | yes | |
| `quantity` | integer | no, default 1 | |
| `visit_number` | integer | yes | номер візиту |
| `price_override` | numeric | yes | ціна позиції в межах саме цієї програми, якщо відрізняється від прайсової (є прецедент у Symbiotyka) |

RLS: public read. Схема створена 09.08.2026, наповнення складом програм — окреме завдання, не виконувалось.

## platform_programs / platform_program_offers

Без структурних змін у цій сесії. `platform_program_offers` зв'язує `platform_programs` (сторінки платформи) з `checkup_programs` (програми клінік, включно з замороженими `standard` — рядки не видалялись).

09.08.2026 додано 6 нових оферів (Р29): `zhinochyi-profilaktychnyi → female-checkup-do-30`, `zhinochyi-profilaktychnyi → female-checkup-30-40`, `zhinochyi-pislya-40 → female-checkup-vid-50`, `cholovichyi-profilaktychnyi → male-checkup-do-30`, `cholovichyi-profilaktychnyi → male-checkup-30-40`, `cholovichyi-pislia-40 → male-checkup-vid-50`.

Після цього всі 10 харківських платформних сторінок (2 за статтю + 8 вікових) мають ≥1 офер із `program_type = 'clinic'`.

## Історія міграцій (ця сесія, 09.08.2026)

1. `add_checkup_programs_program_type` — колонка `program_type`, заповнення, дефолт `clinic` для Онклінік
2. `add_checkup_programs_price_date` — колонка `price_date`, заповнення для 4 профілактичних, оновлення ціни `zhinochyi-pislya-40` → 16107
3. `create_clinic_services_and_program_services` — дві нові таблиці + RLS
4. `seed_clinic_services_onclinic_kharkiv` — 10 рядків довідника послуг
5. `link_clinic_programs_to_age_pages` — 6 рядків `platform_program_offers`

## Відкрито, не вирішено цією сесією

- Долю старих одиничних `checkup_programs.age_group` / `platform_programs.age_group` (текстове поле) відносно нового `program_type` не переглядали — поза межами `task-cowork-01-migration.md`
- Видалення `program_type` з `composition` — окремий крок, не зараз
- Наповнення `program_services` фактичним складом програм — окреме завдання
