# COWORK REPORT — Cleanup Hub v3 (міома + ендометріоз)
**Дата:** 2026-04-17  
**Виконавець:** Claude (Cowork, автономний режим)  
**Базується на:** COWORK-REPORT-redesign-v3.md  

---

## Що зроблено

### Пріоритет 1 — Системна типографіка H2

**Застосовано у всіх hub-компонентах:**
```
font-display font-bold text-[22px] md:text-[26px] text-text-primary mb-4 md:mb-5 tracking-tight
```

Файли:
- `components/hub/OrientationBlock.tsx` — H2 оновлено
- `components/hub/PatientPath.tsx` — H2 оновлено
- `components/hub/WhenToActBlock.tsx` — H2 оновлено + текст заголовку
- `components/hub/SymptomsBlock.tsx` — H2 оновлено
- `components/hub/PricingBlock.tsx` — H2 оновлено (+ повний переписів компонента)
- `components/hub/DoctorsByMethod.tsx` — H2 оновлено
- `components/hub/FAQAccordion.tsx` — H2 оновлено
- `components/hub/ClinicCitySelector.tsx` — H2 оновлено

`app/cases/endometrioz/page.tsx` — усі inline H2 (orientation, path, symptoms, when-to-act, methods, pricing, clinics, doctors, faq) оновлені на той самий патерн через `font-display` клас (видалено inline `style` з `fontFamily`).

### 1.2 MethodCards — прибрано нумерацію

`components/hub/MethodCards.tsx`:
- `'6.1 Медикаментозне лікування'` → `'Медикаментозне лікування'`
- `'6.2 Гістероскопічна міомектомія'` → `'Гістероскопічна міомектомія'`
- `'6.3 Лапароскопічна міомектомія'` → `'Лапароскопічна міомектомія'`
- `'6.4 Відкрита міомектомія (лапаротомія)'` → `'Відкрита міомектомія (лапаротомія)'`
- `'6.5 Емболізація маткових артерій (ЕМА)'` → `'Емболізація маткових артерій (ЕМА)'`
- `'6.6 Гістеректомія'` → `'Гістеректомія'`

### Пріоритет 2 — PricingBlock (міома + ендометріоз)

**`components/hub/PricingBlock.tsx`** — повний переписів:
- H2: "Вартість: НСЗУ чи приват" → **"Вартість лікування"**
- Блок "По НСЗУ" (синій, `bg-blue-50`) — **видалено повністю**
- Lead: новий текст "Ціни у приватних клініках залежать від методу..."
- Таблиця цін — **на всю ширину** (прибрано 2-колонковий layout)
- Блоки "Зазвичай входить / НЕ входить" — **2 симетричні колонки** під таблицею

**`app/cases/endometrioz/page.tsx`** — inline pricing секція (секція 8) аналогічно:
- H2: "Вартість: НСЗУ чи приват" → **"Вартість лікування"**
- Блок "По НСЗУ" — **видалено**
- Lead: оновлено
- Таблиця: full-width
- Додано блоки "Входить / НЕ входить"

### Пріоритет 3 — MedicalHero та контент

**`components/hub/MedicalHero.tsx`:**
- Grid: `items-center` → **`items-start`**
- H1: додано **`max-w-[680px]`**
- Facts Card: додано **`max-w-[420px]`**

**`components/hub/WhenToActBlock.tsx`:**
- H2: "Коли спостереження ок, а коли діяти" → **"Коли чекати, а коли потрібне лікування"**

**`components/hub/PatientPath.tsx`** — крок 3 (міома):
- Новий текст: "Визначте який метод вам підходить. Квіз з 5 питань допоможе зорієнтуватись, який з шести варіантів відповідає вашій ситуації — тип вузла, вік, плани на вагітність, інтенсивність симптомів."

**`app/cases/endometrioz/page.tsx`** — PatientPath крок 3 (ендометріоз):
- Новий текст: "Визначте який метод вам підходить. Квіз з 5 питань допоможе зорієнтуватись, який з шести варіантів відповідає вашій ситуації — вік, плани на вагітність, інтенсивність болю, попередня терапія."

### Пріоритет 4 — Диференційований spacing

**Hub-компоненти (щільні секції) — `py-8` → `py-12 md:py-16`:**
- OrientationBlock, PatientPath, WhenToActBlock, SymptomsBlock, DoctorsByMethod, ClinicCitySelector, PricingBlock

**Hub-компоненти (текстові секції) — `py-8` → `py-8 md:py-10`:**
- FAQAccordion

**`app/cases/endometrioz/page.tsx` — inline sections:**
- Dense sections: `pb-8` → `pb-12 md:pb-16` (orientation, path, methods, clinics, doctors)
- Text section: `pb-8` → `pb-8 md:pb-10` (faq)
- Pricing: `pb-8` → `pb-12 md:pb-16`

---

## Definition of done — чеклист

### Типографіка
- [x] Всі H2 в hub-компонентах: `font-display font-bold text-[22px] md:text-[26px] mb-4 md:mb-5 tracking-tight`
- [x] Префікс нумерації `6.1`–`6.6` видалено з MethodCards
- [x] "Вартість: НСЗУ чи приват" → "Вартість лікування" (обидві сторінки)
- [x] "Коли спостереження ок, а коли діяти" → "Коли чекати, а коли потрібне лікування"

### PricingBlock
- [x] Блок "По НСЗУ" видалено повністю (обидві сторінки)
- [x] `bg-blue-50` прибрано
- [x] Таблиця цін на всю ширину (обидві сторінки)
- [x] Блоки "Входить / НЕ входить" — 2 симетричні колонки (обидві сторінки)
- [x] Lead-параграф оновлено (обидві сторінки)

### Medical Hero
- [x] `items-start` на grid
- [x] `max-w-[420px]` на картці фактів
- [x] `max-w-[680px]` на H1

### Контент
- [x] PatientPath крок 3 — новий текст (міома)
- [x] PatientPath крок 3 — новий текст (ендометріоз)

### Spacing
- [x] Щільні секції: `py-12 md:py-16`
- [x] Текстові секції: `py-8 md:py-10`

---

## QA нотатки

Build недоступний у sandbox (node_modules не встановлені). Рекомендую:
1. `cd checkup-main && npm run build` — перевірити на TypeScript помилки
2. Перевірити `/cases/mioma-matky` і `/cases/endometrioz` на v5.check-up.in.ua після push

---

## Відомі обмеження (в межах задачі не змінювались)

- GeoBlock і EEATBlock — не торкались (відповідно до scope)
- Symptom pages — окрема задача
- НСЗУ контент — повернемось після інсайтів від клінік
- Квіз з містом — окрема задача
