# Карта сторінок Харкова
## check-up.in.ua | Варіант A (1 клініка — Онклінік)

---

## URL-структура (нові сторінки)

### Основний домен (платформа)

```
UA:
/ukr/kharkiv                              → загальна сторінка міста
/ukr/female-checkup/kharkiv               → агрегатор жіночих вікових сторінок
/ukr/female-checkup/do-30-rokiv/kharkiv   → жіночий чекап до 30
/ukr/female-checkup/30-40-rokiv/kharkiv   → жіночий чекап 30-40
/ukr/female-checkup/40-50-rokiv/kharkiv   → жіночий чекап 40-50
/ukr/female-checkup/vid-50-rokiv/kharkiv  → жіночий чекап від 50
/ukr/male-checkup/kharkiv                 → агрегатор чоловічих вікових сторінок
/ukr/male-checkup/do-30-rokiv/kharkiv     → чоловічий чекап до 30
/ukr/male-checkup/30-40-rokiv/kharkiv     → чоловічий чекап 30-40
/ukr/male-checkup/40-50-rokiv/kharkiv     → чоловічий чекап 40-50
/ukr/male-checkup/vid-50-rokiv/kharkiv    → чоловічий чекап від 50
/ukr/materynstvo/planuvannya-vahitnosti/kharkiv → планування вагітності (останнє в черзі)

RU:
/kharkov                                  → загальна сторінка міста
/female-checkup/kharkov                   → агрегатор жіночих вікових сторінок
/female-checkup/do-30-let/kharkov         → жіночий чекап до 30
/female-checkup/30-40-let/kharkov         → жіночий чекап 30-40
/female-checkup/40-50-let/kharkov         → жіночий чекап 40-50
/female-checkup/ot-50-let/kharkov         → жіночий чекап від 50
/male-checkup/kharkov                     → агрегатор чоловічих вікових сторінок
/male-checkup/do-30-let/kharkov           → чоловічий чекап до 30
/male-checkup/30-40-let/kharkov           → чоловічий чекап 30-40
/male-checkup/40-50-let/kharkov           → чоловічий чекап 40-50
/male-checkup/ot-50-let/kharkov           → чоловічий чекап від 50
```

### Піддомен клініки

```
onclinic.check-up.in.ua                   → головна Онклінік (чекапи + кейси гінекології)
onclinic.check-up.in.ua/kharkiv           → Онклінік Харків (деталі клініки, лікарі, програми, кейси)
```

Примітка: піддомен вже створюється для кейсів оперативної гінекології.
Чекапи додаються на той самий піддомен як окремий розділ.

---

## 301 редиректи зі старих URL

### Пріоритет 1 — сторінки з трафіком (>50 кліків)

| Стара URL | Кліки | → Нова URL |
|---|---|---|
| /kharkov | 593 | /kharkov (залишається, оновлюється) |
| /onclinic/kharkov | 257 | onclinic.check-up.in.ua/kharkiv |
| /ukr/kharkiv | 248 | /ukr/kharkiv (залишається, оновлюється) |
| /blog/medcenter-doctor-kharkov | 205 | onclinic.check-up.in.ua/kharkiv (або зберегти блог) |
| /female-checkup/kharkov | 147 | /female-checkup/kharkov (залишається, оновлюється) |
| /akusherstvo/planirovanie-beremennosti/kharkov | 93 | /ukr/materynstvo/planuvannya-vahitnosti/kharkiv |
| /male-checkup/kharkov | 79 | /male-checkup/kharkov (залишається, оновлюється) |
| /sport-checkup/kharkov | 76 | /kharkov (спорт-чекап → загальна, якщо немає окремої) |
| /ukr/male-checkup/kharkiv | 73 | /ukr/male-checkup/kharkiv (залишається, оновлюється) |
| /doctor-kharkov | 55 | onclinic.check-up.in.ua/kharkiv#doctors |
| /child-checkup/kharkov | 53 | /kharkov (дитячий відкладено) |

### Пріоритет 2 — профілі лікарів (зберігають трафік)

| Стара URL | Кліки | → Нова URL |
|---|---|---|
| /ukr/onclinic-kharkiv/tproduct/...-stepanchenko-... | 16 | onclinic.check-up.in.ua/kharkiv/doctors/stepanchenko |
| /ukr/onclinic-kharkiv/tproduct/...-lizogub-... | 15 | onclinic.check-up.in.ua/kharkiv/doctors/lizogub |
| /ukr/onclinic-kharkiv/tproduct/...-trubeko-... | 14 | onclinic.check-up.in.ua/kharkiv/doctors/trubeko |
| /ukr/onclinic-kharkiv/tproduct/...-mangusheva-... | 10 | onclinic.check-up.in.ua/kharkiv/doctors/mangusheva |
| /ukr/onclinic-kharkiv/tproduct/...-shevchenko-... | 10 | onclinic.check-up.in.ua/kharkiv/doctors/shevchenko |
| /ukr/onclinic-kharkiv/tproduct/...-strutinska-... | 11 | onclinic.check-up.in.ua/kharkiv/doctors/strutinska |
| /ukr/onclinic-kharkiv/tproduct/...-udovichenko-... | 8 | onclinic.check-up.in.ua/kharkiv/doctors/udovichenko |
| /ukr/onclinic-kharkiv/tproduct/...-selvanova-... | 7 | onclinic.check-up.in.ua/kharkiv/doctors/selvanova |

### Пріоритет 3 — решта onclinic-kharkiv

```
/ukr/onclinic-kharkiv → onclinic.check-up.in.ua/kharkiv
/ukr/onclinic-kharkiv/tproduct/...-check-up-zhnochii-... → onclinic.check-up.in.ua/kharkiv/checkup/zhinochyi-profilaktychnyi
/ukr/onclinic-kharkiv/tproduct/...-check-up-cholovchii-... → onclinic.check-up.in.ua/kharkiv/checkup/cholovichyi-profilaktychnyi
/onclinic/kharkov/tproduct/... → відповідний шлях на піддомені
/ukr/doctors/kharkiv → onclinic.check-up.in.ua/kharkiv#doctors
/ukr/doctors/kharkiv/tproduct/... → відповідний профіль на піддомені
```

### Пріоритет 4 — видалити (0 кліків, застарілі)

```
/covid-19/testirovanie/kharkov → /kharkov
/covid-19/post-covid/kharkov → /kharkov
/beauty-checkup/kharkov → /kharkov
/corporate/kharkov → /kharkov
/clinics/kharkov → /kharkov
```

---

## Ієрархія сторінок та черга реалізації

### Фаза 1 — Core (робимо зараз)

```
1. /ukr/kharkiv + /kharkov
   Загальна сторінка міста. Квіз → заявка без переходу.
   Найбільше трафіку. Перша в черзі.

2. /ukr/female-checkup/kharkiv + /female-checkup/kharkov
   Агрегатор жіночих вікових сторінок.
   
3. /ukr/male-checkup/kharkiv + /male-checkup/kharkov
   Агрегатор чоловічих вікових сторінок.
```

### Фаза 2 — Вікові сторінки

```
4-11. Вікові сторінки (8 шт UA + 8 шт RU = 16 URL)
     Кожна: гайдлайн-блок + офер Онклінік + квіз → заявка
```

### Фаза 3 — Піддомен Онклінік (чекап-розділ)

```
12. onclinic.check-up.in.ua/kharkiv — деталі клініки
    Програми з повним складом, лікарі, філії, форма запису.
    Вже створюється для кейсів — додаємо чекап-розділ.
```

### Фаза 4 — Планування вагітності

```
13. /ukr/materynstvo/planuvannya-vahitnosti/kharkiv
    Окремий напрямок. Після всіх чекап-сторінок.
```

---

## Програми Онклінік для сторінок

### Маппінг програм → вікові сторінки

| Вікова сторінка | Програма Онклінік | Ціна зі знижкою | Ціна без |
|---|---|---|---|
| Жінки до 30 | Жіночий профілактичний | 11 724 | 13 522 |
| Жінки 30-40 | Жіночий профілактичний | 11 724 | 13 522 |
| Жінки 40-50 | Жіночий після 40 | 14 634 | 16 972 |
| Жінки від 50 | Жіночий після 40 | 14 634 | 16 972 |
| Чоловіки до 30 | Чоловічий профілактичний | 7 722 | 9 009 |
| Чоловіки 30-40 | Чоловічий профілактичний | 7 722 | 9 009 |
| Чоловіки 40-50 | Чоловічий після 40 | 15 386 | 17 769 |
| Чоловіки від 50 | Чоловічий після 40 | 15 386 | 17 769 |

Примітка: Онклінік має 2 градації (профілактичний / після 40), ми маємо 4 вікових.
Гайдлайн-блок відрізняється для кожного віку — офер клініки однаковий в межах градації.

### Спеціалізовані програми (на піддомені + на агрегаторах як додаткові)

| Програма | Ціна зі знижкою | Ціна без | Де показуємо |
|---|---|---|---|
| Кардіологічний | 11 336 | 13 022 | Піддомен + агрегатор (badge "Спеціалізована") |
| Судинний | 10 263 | 11 917 | Піддомен + агрегатор |
| Метаболічний | 12 442 | 14 352 | Піддомен + агрегатор |
| Надлишкова вага | 6 587 | 7 545 | Тільки піддомен [УТОЧНИТИ СКЛАД] |
| Дефіцит ваги | 7 739 | 8 815 | Тільки піддомен [УТОЧНИТИ СКЛАД] |
| Баланс харчування | 9 089 | 10 315 | Тільки піддомен [УТОЧНИТИ СКЛАД] |

---

## hreflang між мовними версіями

```html
<!-- На /ukr/kharkiv -->
<link rel="alternate" hreflang="uk" href="https://check-up.in.ua/ukr/kharkiv" />
<link rel="alternate" hreflang="ru" href="https://check-up.in.ua/kharkov" />

<!-- На /kharkov -->
<link rel="alternate" hreflang="ru" href="https://check-up.in.ua/kharkov" />
<link rel="alternate" hreflang="uk" href="https://check-up.in.ua/ukr/kharkiv" />
```

Аналогічно для всіх пар UA/RU сторінок.

---

*Документ: квітень 2026*
*Наступний крок: тексти для /ukr/kharkiv*
