# TURKEY-MIGRATION – міграція сторінок «Чекап у Туреччині» з Tilda

Версія: 0.7 · 18.11.2026
Власник: чат ТУРЕЧЧИНА · міграція з Tilda (проєкт «check-up · Міграція check-up.in.ua на Next.js»)
Затверджено: Ігор, 16.11.2026 (розділи 1–3); хвиля B і перенесення блоків abroad – 18.11.2026
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

**Хвиля B – abroad, 301.** Хвиля A на проді з 17.11.2026. Порядок: спершу PR 3 (розділ 7) у main, потім домен у Vercel і DNS. Інакше abroad тимчасово показує дубль основного сайту. DNS abroad.check-up.in.ua → Vercel (робить Ігор), правила за хостом у checkup-main. http і https – однаково.

| abroad | → check-up.in.ua |
| --- | --- |
| `/` | `/turkey` |
| `/ru/clinic/livhospital` | `/turkey/livhospital` |
| `/ru/clinic/livhospital/tproduct/*` (8) | `/turkey/livhospital` |
| `/ru/clinic/anadolumedicalcenter` | `/turkey/anadolu` |
| `/ru/clinic/anadolumedicalcenter/tproduct/*` (5) | `/turkey/anadolu` |
| `/ru/thanks/`, `/page53016105.html`, будь-яка інша | `/turkey` |

Усі правила – 301 (постійна), ціль – абсолютна адреса `https://check-up.in.ua/...`. Шлях abroad без урахування регістру і кінцевого `/`. `robots.txt` і `sitemap.xml` на abroad теж ведуть на `/turkey`.

До 301 переносимо з abroad блоки, яких немає на `/turkey*` (Ігор, 18.11.2026):
- «Ключевые преимущества» – на `/turkey/livhospital` і `/turkey/anadolu`;
- блок довіри «Наши эксперты – практикующие врачи…» (3 пункти) – на хаб `/turkey`.

Не переносимо: згадки Ізраїлю, Німеччини, Австрії; блок «Преимущества нашего сервиса» (у ньому інші країни); форму зі статтю і хронічними хворобами (дані про здоров'я не збираємо).

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
3а. Блок довіри – 3 пункти з `docs/turkey/tilda/abroad-home.md`, блок rec738119221 (хвиля B).
4. Форма консультації без вибору програми – виняток з ui-kit §6.13а для /turkey (рішення Ігоря 17.11.2026: Туреччина – нетиповий напрямок). Заявки переважно йдуть з форм сторінок клінік.

**Сторінка клініки `/turkey/{клініка}`**

1. H1, про клініку – текст Tilda цієї сторінки.
1а. LIV і Anadolu: «Ключевые преимущества» – дослівно з `docs/turkey/tilda/abroad-livhospital.md` і `abroad-anadolu.md` (H2 «Ключевые преимущества:»). У Anadolu пункти згруповано під 4 підзаголовки – структуру зберегти.
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

Рішення чату UX 16.11.2026 – ui-kit v1.16 (checkup-platform PR #230): підписи і посилання згоди – словник-проп у BookingFlow (і BookCta), StickyMobileCta, ProgramPicker (§6.14 п. 1, 2, 4, 5); валюта – проп `currency`, USD для /turkey*, формат «1 200 USD» (§6.14 п. 3); хаб – LinkRows, рядок на клініку з «от {minPrice} USD», кнопок запису на хабі немає (§6.13а); GEO-блок – копія §12 у components/frame/ (§6.14 п. 7). Назви програм і адреси сторінка передає готовими рядками.

Канон записано 17.11.2026: ui-kit v1.16.1, components-map v7.5 (§29.21 GeoBlock, §30.1, §30.3, §30.9, §30.10). Ключі словника заповнено в `docs/turkey/ui-ru.json` v0.3.

Лишилось:
1. Пропи `labels`, `currency`, `policyHref`, спільну функцію формату ціни і копію GeoBlock у коді робить виконавець – PR 1 розділу 7. Норматив перевіряє обидва PR; Library Engineer знімає ⚠ у каталозі після злиття PR 1.
2. Міграція `checkup_programs.currency` – у PR виконавця (розділ 2).

## 4. Порядок робіт

1. Ігор сказав «так» на розділи 1–3 (16.11.2026).
2. Чат ТУРЕЧЧИНА кладе цей документ і файли `docs/turkey/` у репо. Окремий PR у dev, лише документи.
3. Чат «Норматив» звірив розділ 3 з UI-kit (16.11.2026). Чат UX закриває залежності 1–4.
4. Виконавець (окремий чат, Claude Code, Sonnet medium) робить два PR у dev за розділом 7: PR 1 – пропи компонентів, PR 2 – база і сторінки. Адреси в `approved-routes.json` не додає.
5. Чат ТУРЕЧЧИНА перевіряє прев'ю (`?drafts=1`): ціни, склад, Title, H1, canonical, Schema, GEO у View Source, форма.
6. Ігор зливає PR. Потім по одній адресі – додати в `approved-routes.json`, перевірити (200, Title, H1, canonical, форма), далі наступна. Після кожної – SEO Audit Report.
7. Тестова заявка з ім'ям «ТЕСТ» – лише в «тест бот з лідами» (docs/QA-AFTER-DEPLOY.md).
8. Хвиля B: PR 3 (розділ 7) → Ігор зливає в dev і main → Ігор додає домен abroad.check-up.in.ua у Vercel і міняє DNS → чат ТУРЕЧЧИНА перевіряє всі адреси abroad (301 і ціль).

## 5. НЕ РОБИТИ

- Не змінювати адреси `/turkey*`.
- Не писати тексти самостійно: лише дослівно з `docs/turkey/`. Немає тексту – СТОП.
- Не хардкодити ціни і валюту: лише з бази.
- Не створювати нових компонентів; не вистачає – СТОП, питання чату UX.
- Не додавати адреси в `approved-routes.json`. abroad – лише правилами PR 3; домен і DNS виконавець не чіпає.
- Не надсилати тестові заявки в чати і на пошту клінік.
- Не робити push у main, force push, ручний деплой.

## 6. Звіт виконавця

- Версія цього документа, за якою працював.
- Посилання на PR і прев'ю чотирьох сторінок.
- Перелік файлів і міграцій.
- Кількість програм у базі по клініках (live-запит).
- Що не зроблено і чому.

## 7. Задача виконавцю

Виконавець бере задачу лише звідси і називає версію документа. Два PR у dev, по черзі: PR 2 починається після злиття PR 1. Перед кожним PR – `npm ci` і `npm run build`.

### PR 1 – пропи компонентів (без змін на сторінках)

Норма: ui-kit v1.16.1 §6.14; components-map v7.5 §29.21, §30.1, §30.3, §30.9, §30.10 (checkup-platform, dev). Ключі і українські дефолти – таблиці цих розділів.

1. `labels?: Partial<Labels>` у `StickyMobileCta`, `BookingFlow` і `BookCta`, `ProgramPicker`, плаваючому блоці `AgeProgramsZone`. Українські дефолти – дослівно з таблиць CM. Усі видимі рядки й `aria-label` – зі словника; форми множини – `[one, few, many]`.
2. `currency?: 'UAH' | 'USD'` у тих самих компонентах, дефолт `'UAH'`. Одна спільна функція формату ціни: нерозривний пробіл U+00A0 між тисячами і перед валютою, валюта після числа («10 460 грн», «1 200 USD»). Нею замінити локальні `fmt` у цих компонентах.
3. `policyHref?: string` у `BookingFlow`, дефолт `/ukr/policy`.
4. Назви програм, адреси, метро: додати в дані компонентів готові рядки для показу. Якщо сторінка їх не передала – брати `name_ua` / `address_ua` / `metro_ua`, як зараз. Так наявні сторінки не змінюються.
5. `browseLabel` у `StickyMobileCta` → `labels.browse`; один виклик – `app/ukr/prolaps-tazovykh-orhaniv/page.tsx`.
6. Копія GeoBlock (CM §29.21) у `components/frame/` з пропами тексту і адрес.

Перевірка: на прев'ю вікова сторінка Харкова і Ужгорода виглядає як до PR. Допустимі зміни – лише ті, що прямо вимагає CM: форми множини в лічильниках («1 консультація»), «–» замість «—» у «Не знаю – порадьте на дзвінку», нерозривний пробіл у цінах. У звіті – перелік таких змін.

### PR 2 – база і сторінки /turkey*

1. Міграція: `checkup_programs.currency`, `checkup_programs.details` (розділ 2). DATABASE.md – у тому ж PR.
2. Сід: 3 клініки, 19 програм з `docs/turkey/programs.json`. Поля: `name_ru`, `name_ua`, ціна з `price_usd` у `price_regular` і `price_discount`, `currency = 'USD'`, `price_date = 2026-11-16`, склад у `composition`, решта (summary, duration, description, goals, preparation) – у `details`.
3. Філії (`clinic_branches`): LIV – «LIV Hospital Ulus», Ahmet Adnan Saygun Cad., Canan Sokak No:5 34340 Beşiktaş, Стамбул; Anadolu – «Gebze Anadolu Medical Center», Cumhuriyet Mahallesi, 2255. Sk. No:3 41400 Gebze/Kocaeli (обидві – з `docs/turkey/tilda/abroad-*.md`). Acibadem – без філії, GEO-блок без адреси.
4. Сторінки `/turkey`, `/turkey/livhospital`, `/turkey/acibadem`, `/turkey/anadolu` – за розділом 3, тексти з `docs/turkey/tilda/`, підписи і `currency`, `policyHref` – з `docs/turkey/ui-ru.json`. Сторінки доступні лише в режимі чернетки (`?drafts=1`), у `approved-routes.json` їх немає.
5. Заявка: `/api/leads`, `clinic_slug` клініки сторінки, `program_name` – `name_ru`. Тестова заявка – лише з ім'ям «ТЕСТ» і лише в «тест бот з лідами».

Звіт – розділ 6, окремо для кожного PR.

### PR 3 – хвиля B: блоки abroad і 301 (окремий PR у dev)

1. Блоки з розділу 3 (п. 3а хабу, п. 1а сторінки клініки) – дослівно з `docs/turkey/tilda/`. Компоненти – лише наявні за CM v7.5 (список або `Section` з пунктами). Не вистачає – СТОП, питання чату UX.
2. 301 для хоста `abroad.check-up.in.ua` за таблицею розділу 1 – у `next.config.ts` `redirects()` з умовою `has: [{ type: 'host', value: 'abroad.check-up.in.ua' }]` або в `middleware.ts`, як зручніше з наявною логікою. Правила не залежать від `approved-routes.json`: усі цілі вже затверджені.
3. Правила не впливають на інші хости: check-up.in.ua, піддомени, прев'ю.
4. Перевірка локально (`npm run build` і `next start`): `curl -sI -H 'Host: abroad.check-up.in.ua'` для `/`, `/ru/clinic/livhospital`, `/ru/clinic/livhospital/tproduct/1`, `/ru/clinic/anadolumedicalcenter/`, `/RU/Clinic/AnadoluMedicalCenter/tproduct/2`, `/ru/thanks/`, `/robots.txt`, `/abc` – кожна дає 301 і правильний `location`. Той самий запит без заголовка Host – як до PR.
5. Не додавати домен у Vercel, не міняти DNS, не чіпати Tilda.

Звіт – розділ 6 і вивід curl з п. 4.

