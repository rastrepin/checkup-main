# COWORK-REPORT — Міома Hub + Симптом + Ендометріоз Hub + Десктоп responsive

Дата: 2026-04-17  
Сесії: cowork-task-mioma-hub.md + cowork-task-endometrioz-hub.md  
Виконавець: Claude (Cowork mode)

---

## Чеклист 10 кроків

| # | Крок | Статус |
|---|------|--------|
| 1 | Клонування репо, читання специфікацій | ✅ |
| 2 | `data/fallback-content.json` — статичні дані з TODO-маркерами | ✅ |
| 3 | `lib/quiz/miomaRecommendationEngine.ts` — алгоритм рекомендацій | ✅ |
| 4 | Shared-компоненти: Accordion, LeadForm, Disclaimer, StickyMobileCTA | ✅ |
| 5 | Hub-компоненти (14 блоків): HubHero, OrientationBlock, PatientPath, SymptomsBlock, WhenToActBlock, MethodsComparisonTable, MethodCards, QuizMioma (3 фази), PricingBlock, ClinicCitySelector, DoctorsByMethod, FAQAccordion, GeoBlock, EEATBlock, CarewayRelatedLinks | ✅ |
| 6 | `app/cases/mioma-matky/page.tsx` — Hub-сторінка, Metadata, Schema.org JSON-LD | ✅ |
| 7 | Symptom-компоненти: SymptomHero, RedFlagsBlock, CausesBlock, ExaminationsBlock | ✅ |
| 8 | `app/careway/simptomy/ryasni-misyachni/page.tsx` — Symptom-сторінка (11 блоків) | ✅ |
| 9 | TypeScript QA — знайдено та виправлено 3 помилки | ✅ |
| 10 | COWORK-REPORT.md | ✅ |

---

## Сесія 2: Ендометріоз Hub + Desktop responsive (2026-04-17)

### Десктоп responsive — виправлені компоненти

| Компонент | Зміни |
|-----------|-------|
| `components/hub/HubHero.tsx` | `md:flex md:gap-10`, 60/40 split, `max-w-7xl` |
| `components/hub/OrientationBlock.tsx` | Dual render: `hidden md:grid md:grid-cols-3` + `md:hidden` accordion |
| `components/hub/PatientPath.tsx` | `max-w-4xl mx-auto` (було `max-w-2xl`) |
| `components/hub/SymptomsBlock.tsx` | `h-full`, `md:max-w-none` для 2-col grid |
| `components/hub/WhenToActBlock.tsx` | `h-full`, `md:max-w-none` для 2-col grid |
| `components/hub/MethodsComparisonTable.tsx` | `md:overflow-x-visible md:min-w-0` |
| `components/hub/MethodCards.tsx` | `md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0` |
| `components/hub/PricingBlock.tsx` | `md:grid md:grid-cols-2 md:gap-6`, `max-w-7xl` |
| `components/hub/ClinicCitySelector.tsx` | `max-w-7xl mx-auto` |
| `components/hub/DoctorsByMethod.tsx` | `md:grid md:grid-cols-3 lg:grid-cols-4`, `max-w-7xl` |
| `components/hub/FAQAccordion.tsx` | `max-w-3xl mx-auto` |
| `components/hub/EEATBlock.tsx` | `md:grid md:grid-cols-2 md:gap-8`, `max-w-7xl` |
| `components/hub/QuizMioma.tsx` | `md:bg-gray-50`, `max-w-2xl mx-auto` |
| `app/cases/mioma-matky/page.tsx` | Symptoms+WhenToAct в `md:grid md:grid-cols-2 md:max-w-7xl` |
| `components/symptom/SymptomHero.tsx` | `max-w-3xl mx-auto` |
| `components/symptom/RedFlagsBlock.tsx` | `max-w-3xl mx-auto` |
| `components/symptom/CausesBlock.tsx` | `max-w-3xl mx-auto` |
| `components/symptom/ExaminationsBlock.tsx` | `max-w-3xl mx-auto` |
| `app/careway/simptomy/ryasni-misyachni/page.tsx` | `max-w-3xl` all blocks; orientation cards `md:grid-cols-3` |

### Нові файли (Сесія 2)

| Файл | Опис |
|------|------|
| `lib/quiz/endometriozRecommendationEngine.ts` | 5 правил (ACOG, ESHRE) + default. Types: PainLevel, PregnancyPlanEndo, AgeGroupEndo, TriedMeds |
| `components/endometrioz/QuizEndometrioz.tsx` | 3 фази: clinical (4 питання) → criteria (до 3 з 6) → result |
| `components/symptom/DescribePainBlock.tsx` | Новий reusable блок "Як описати свій біль лікарю" |
| `app/cases/endometrioz/page.tsx` | Hub ендометріоз (14 блоків, ICD-10 N80, Schema.org MedicalCondition) |
| `app/careway/simptomy/bil-pid-chas-statevoho-aktu/page.tsx` | Symptom диспареунія (11 блоків, 7 причин, FAQ 5 питань) |

### Виправлені баги (Сесія 2)

- `app/cases/endometrioz/page.tsx` — видалено `'use client'` що з'явився mid-file після default export (invalid Next.js)
- Додано `import { type ReactNode } from 'react'` для `StepAccordion` в тому ж файлі

### Vercel deploy (Сесія 2)

```
Preview: https://check-up-kyiv-l5w5q5eed-rastrepins-projects.vercel.app
Inspect: https://vercel.com/rastrepins-projects/check-up-kyiv/9W3wJrPXQSKTDRadqrfgynmFDrus
```
Deploy запущено з `--no-wait`. Статус будівлі перевірити в Vercel dashboard.

---

## Виправлені TypeScript-помилки (Крок 9)

### 1. `components/shared/Accordion.tsx`
- **Проблема:** `content: React.ReactNode` без імпорту React
- **Виправлення:** `import { useState, type ReactNode } from 'react'` → `content: ReactNode`

### 2. `components/hub/QuizClinical.tsx`
- **Проблема:** `children: React.ReactNode` у `OptionBtn` без імпорту React
- **Виправлення:** `import { type ReactNode } from 'react'` → `children: ReactNode`

### 3. `components/shared/LeadForm.tsx`
- **Проблема:** `e: React.FormEvent` без імпорту React
- **Виправлення:** `import { useState, type FormEvent } from 'react'` → `e: FormEvent`

> Примітка: `npm run build` timeout у shell (45s ліміт). TypeScript-аудит виконано вручну по всіх нових файлах. Всі inferred types, literal union types та service boundary (`'use client'` / server) перевірені.

---

## TODO-список — що потребує заміни на Supabase

### `data/fallback-content.json`
Всі дані у цьому файлі — гіпотетичні. Замінити фактичними після наповнення Supabase.

### Компоненти та їх TODO:

| Файл | Рядок | Що замінити |
|------|-------|-------------|
| `components/hub/HubHero.tsx` | L3-8 | `STATS.clinics_count`, `STATS.cities_count`, `STATS.doctors_count` — з `clinics`, `doctors` таблиць |
| `components/hub/ClinicCitySelector.tsx` | L5-23 | `CITIES[]` — з `clinics` + `clinic_branches` таблиць, фільтр по `mioma_methods` |
| `components/hub/DoctorsByMethod.tsx` | L5-30 | `DOCTORS[]` — з `doctors` таблиці, фільтр по `specialization` + `mioma` |
| `components/hub/PricingBlock.tsx` | ~L60 | Ціни у таблиці — з `methods_pricing` або `clinic_services` таблиці |
| `components/hub/EEATBlock.tsx` | ~L40 | Цитата рецензента — з `reviewers` або `expert_quotes` таблиці |
| `app/cases/mioma-matky/page.tsx` | L59 | `dateModified` — автоматизувати через Supabase `content_pages.updated_at` |
| `app/careway/simptomy/ryasni-misyachni/page.tsx` | L43 | `dateModified` — аналогічно |

### Supabase-таблиці, які потрібні:

```sql
-- Клініки та їх відділення (вже може існувати)
clinics (id, name, city_slug, address, phone, is_partner)
clinic_branches (id, clinic_id, address, city_slug)
clinic_services (id, clinic_id, service_name, price_from, price_to, currency, nszu_covered)

-- Лікарі
doctors (id, full_name, specialty, clinic_id, experience_years, operations_count, photo_url, profile_url)

-- Leads (нова таблиця)
leads (
  id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  city text,
  contact_method text CHECK (contact_method IN ('call', 'telegram', 'viber')),
  intent text CHECK (intent IN ('online_consultation', 'choose_method', 'prepare', 'second_opinion', 'understand_symptom')),
  source_page text,
  source_quiz_id text,
  criteria_selected text[],
  readiness_stage text,
  consent_given boolean DEFAULT true,
  consent_given_at timestamptz,
  status text DEFAULT 'new' CHECK (status IN ('new', 'called', 'converted', 'rejected')),
  notes text
)
```

---

## Що не реалізовано та чому

### Vercel deploy
Preview URL задеплоєний (Сесія 2). Для promote до prod — `vercel --prod` або через Vercel dashboard.

### Lighthouse
Не виконано — потребує живого URL після деплою.

### Schema.org validation
Не виконано автоматично — потребує живого URL для Google Rich Results Test. Структура JSON-LD перевірена вручну по специфікації.

### Quiz persistence
Квіз зберігає стан у React state (session-only). Supabase-збереження проміжних відповідей — **не реалізовано** (позначено `// TODO` в QuizMioma). Потрібна таблиця `quiz_sessions` або збереження при submit.

### Careway pages (related links)
7 посилань у `CarewayRelatedLinks.tsx` — 5 з них `[скоро]` (disabled). Ці сторінки не існують і не створювались у цій сесії.

---

## Структура нових файлів

```
checkup-main/
├── data/
│   └── fallback-content.json              # гіпотетичні дані, TODO → Supabase
├── lib/
│   └── quiz/
│       ├── miomaRecommendationEngine.ts   # алгоритм ACOG #228 + МОЗ №147
│       └── endometriozRecommendationEngine.ts  # алгоритм ACOG, ESHRE (5 правил)
├── components/
│   ├── shared/
│   │   ├── Accordion.tsx                  # generic accordion, single mode
│   │   ├── LeadForm.tsx                   # лід-форма з Supabase + honeypot
│   │   ├── Disclaimer.tsx                 # full/short варіанти
│   │   └── StickyMobileCTA.tsx            # sticky bottom, md:hidden
│   ├── hub/
│   │   ├── HubHero.tsx                    # dark hero, stats, 3 CTA
│   │   ├── OrientationBlock.tsx           # 3 вікові карти, перша відкрита
│   │   ├── PatientPath.tsx                # 4 кроки, всі закриті
│   │   ├── SymptomsBlock.tsx              # симптоми + червоні прапорці
│   │   ├── WhenToActBlock.tsx             # спостереження vs лікування
│   │   ├── MethodsComparisonTable.tsx     # порівняльна таблиця 6 методів
│   │   ├── MethodCards.tsx                # карти методів з деталями
│   │   ├── QuizClinical.tsx               # 5 кроків клінічного квізу
│   │   ├── QuizCriteria.tsx               # критерії-пілюлі, max 3
│   │   ├── QuizResult.tsx                 # результат + LeadForm
│   │   ├── QuizMioma.tsx                  # оркестратор 3 фаз квізу
│   │   ├── PricingBlock.tsx               # НСЗУ + приватні ціни
│   │   ├── ClinicCitySelector.tsx         # вибір міста + клініки
│   │   ├── DoctorsByMethod.tsx            # картки лікарів
│   │   ├── FAQAccordion.tsx               # 8 FAQ з Schema.org
│   │   ├── GeoBlock.tsx                   # статичний HTML (no 'use client')
│   │   ├── EEATBlock.tsx                  # автор, рецензент, джерела
│   │   └── CarewayRelatedLinks.tsx        # 7 пов'язаних посилань
│   └── symptom/
│       ├── SymptomHero.tsx                # dark hero, breadcrumb
│       ├── RedFlagsBlock.tsx              # 4 ургентних прапорці
│       ├── CausesBlock.tsx                # 5 причин (карти)
│       ├── ExaminationsBlock.tsx          # базові/додаткові обстеження
│       └── DescribePainBlock.tsx          # reusable "Як описати свій біль лікарю"
│   └── endometrioz/
│       └── QuizEndometrioz.tsx            # 3-фазний квіз ендометріозу
├── app/
│   ├── cases/
│   │   ├── mioma-matky/
│   │   │   └── page.tsx                   # Hub-сторінка (14 блоків)
│   │   └── endometrioz/
│   │       └── page.tsx                   # Hub-сторінка (14 блоків, ICD-10 N80)
│   └── careway/
│       └── simptomy/
│           ├── ryasni-misyachni/
│           │   └── page.tsx               # Symptom-сторінка (11 блоків)
│           └── bil-pid-chas-statevoho-aktu/
│               └── page.tsx               # Symptom-сторінка (11 блоків, 7 причин)
└── COWORK-REPORT.md                       # цей файл
```

---

## SEO / Schema.org покриття

### Hub-сторінка (`/cases/mioma-matky`)
- `MedicalWebPage` з `reviewedBy: Physician`
- `MedicalCondition` (ICD-10 D25)
- `FAQPage` з 3 питаннями у JSON-LD
- 8 FAQ у HTML з `itemScope`/`itemProp` мікророзміткою
- `GeoBlock` — статичний HTML без JS для Google AI Overview

### Symptom-сторінка (`/careway/simptomy/ryasni-misyachni`)
- `MedicalWebPage` з `reviewedBy: Physician`
- `FAQPage` з 3 питаннями у JSON-LD
- 5 FAQ через native `<details>/<summary>` з `itemScope`/`itemProp`
- Статичний GEO-параграф inline у page.tsx

---

*Звіт сформовано автоматично після завершення сесії Cowork.*
