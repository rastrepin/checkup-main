# CHECKUP-LOGIC.md — Логіка чекап-програм
> Canonical документ. Оновлювати після кожної зміни архітектури.

## 1. Таблиці та їх роль

`platform_programs` — сторінки платформи (що показується в URL)
`platform_program_offers` — зв'язок сторінка → офер клініки
`checkup_programs` — офери клінік (реальні програми з цінами)
`clinics` — клініки-партнери
`clinic_branches` — філії клінік (є поле `city`)

## 2. Типи програм в checkup_programs

Визначається по slug prefix:
- `regular-*` → базова програма (мінімум аналізів, низька ціна)
- `standard-*` → стандартна програма (середній склад)
- `zhinochyi-*` / `cholovichyi-*` → повна програма клініки
- `kardiologichnyi-*` → спеціалізована

Поле `is_specialized`:
- `false` → стандартні вікові програми
- `true` → спеціалізовані (кардіо, метаболічний тощо)

## 3. Логіка на кожному типі сторінки

### Сторінка програми

URL: `/ukr/female-checkup/first-checkup-40-50/kharkiv`

**Крок 1 — знайти platform_program:**
```sql
SELECT id, gender, age_group, is_specialized
FROM platform_programs
WHERE gender = 'female' 
  AND age_group = '40-50' 
  AND is_specialized = false
  AND slug = 'female-checkup-40-50';
```

**Крок 2 — офери клінік (Компонент 1 — ClinicOffers):**
```sql
SELECT DISTINCT ON (c.id)
  cp.id, cp.name_ua, cp.price_discount, cp.price_regular,
  cp.consultations_count, cp.analyses_count, cp.diagnostics_count,
  c.name, c.slug, c.logo_url
FROM platform_program_offers ppo
JOIN checkup_programs cp ON cp.id = ppo.checkup_program_id
JOIN clinics c ON c.id = cp.clinic_id
WHERE ppo.platform_program_id = :platformProgramId
  AND cp.is_active = true
  AND c.is_active = true
  AND EXISTS (
    SELECT 1 FROM clinic_branches cb 
    WHERE cb.clinic_id = c.id AND cb.city = :city
  )
ORDER BY c.id, cp.price_discount ASC;
```

Правила:
- 1 клініка = 1 картка (`DISTINCT ON c.id`)
- `platform_program_offers` контролює які офери показувати — додаткова фільтрація по slug не потрібна
- `counts` показувати тільки якщо `consultations_count IS NOT NULL`
- Фільтр по місту через `EXISTS` на `clinic_branches`

**Крок 3 — схожі програми (Компонент 2 — SimilarPrograms):**
```sql
SELECT id, slug, name_ua, gender, age_group
FROM platform_programs
WHERE gender = :gender
  AND age_group = :ageGroup
  AND is_specialized = false
  AND id != :currentId
ORDER BY sort_order ASC;
```

Правила:
- Показує сторінки програм, НЕ офери клінік
- Посилання: `/ukr/[gender]-checkup/[slug]/[city]`

---

### Сторінка каталогу міста

URL: `/ukr/female-checkup/kharkiv`

```sql
SELECT cp.*, c.name, c.slug, c.logo_url
FROM checkup_programs cp
JOIN clinics c ON c.id = cp.clinic_id
WHERE cp.standard_slug = :standardSlug
  AND cp.is_active = true
  AND c.is_active = true
  AND EXISTS (
    SELECT 1 FROM clinic_branches cb
    WHERE cb.clinic_id = c.id AND cb.city = :city
  )
ORDER BY cp.price_discount ASC;
```

Правила:
- Показує ВСІ типи програм (`regular` + `standard` + full)
- Групує по клініці якщо потрібно
- Фільтр по місту через `EXISTS` на `clinic_branches`

---

### Сторінка міста (загальна)

URL: `/ukr/kharkiv`

Показує: каталог типів програм (посилання на
`female-checkup/kharkiv`, `male-checkup/kharkiv` тощо)
НЕ показує офери напряму.

## 4. Параметри з URL

`/ukr/[gender]-checkup/[program-slug]/[city]`

- `gender` → `female` / `male`
- `program-slug` → slug в `platform_programs`
- `city` → фільтр для `clinic_branches.city`

## 5. Правила показу counts

Показувати блок з лічильниками тільки якщо:
```
consultations_count IS NOT NULL 
AND analyses_count IS NOT NULL 
AND diagnostics_count IS NOT NULL
```

`Regular` та `Standard` програми зазвичай мають `counts = null` —
блок не показувати.

## 6. Відкриті питання

- [ ] Як показувати `regular` програми на сторінці каталогу —
      окремою карткою чи як варіант основної?
- [ ] `sort_order` в `platform_program_offers` поки не використовується
- [x] ~~`lat/lng` в `clinic_branches` = null для Харкова~~ —
      заповнено 24.04.2026 для всіх 3 філій onclinic-kharkiv
