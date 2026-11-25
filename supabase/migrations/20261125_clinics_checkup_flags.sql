-- Позначки Ігоря в clinics (CONVEYOR-CITIES v1.2.1 §2.5, Етап 0 §3.1; DATABASE.md §3.1).
-- Три нові колонки і їхні значення за рішенням Ігоря 25.11.2026 (1а, 2а крім Оксфорд Медікал, 3б).
-- Наявні колонки не змінюються, на сайті нічого не змінюється: код ці колонки поки не читає.
-- Запуск у базі – лише Ігор, після злиття PR. Агенти міграцію не запускають.

begin;

-- 1. Колонки
alter table public.clinics
  add column if not exists checkup_capable boolean not null default false,  -- умова 1: договір і новий формат
  add column if not exists checkup_channel_checked_at date,                 -- умова 3: дата, коли Ігор підтвердив канал заявок
  add column if not exists checkup_reviewer text;                           -- умова 9: agreed / without / порожньо

alter table public.clinics
  drop constraint if exists clinics_checkup_reviewer_check;
alter table public.clinics
  add constraint clinics_checkup_reviewer_check
  check (checkup_reviewer is null or checkup_reviewer in ('agreed', 'without'));

-- 2. «Спроможна» (checkup_capable = true): усі ОН Клінік, Кредо Клінік, РОКЛ, Symbiotyka.
--    Не спроможні – Оксфорд Медікал (oxfordmed), 100% життя, ЦМСД, решта клінік: лишається default false.
--    Мережевий запис onclinic (неактивний, city network) не позначається: це не клініка міста.
update public.clinics
set checkup_capable = true
where slug like 'onclinic-%'
   or slug in ('credoclinic', 'rokl', 'symbiotyka');

-- 3. Рецензент «згода є» (checkup_reviewer = 'agreed'): клініки в конфігу міст Дніпро, Полтава, Черкаси, Харків.
--    У Полтаві в конфігу лише ОН Клінік; 100zhyttya-poltava і cmsd-poltava лишаються порожніми.
--    Решта клінік – порожньо (не вирішено).
update public.clinics
set checkup_reviewer = 'agreed'
where slug in ('onclinic-dnipro', 'onclinic-poltava', 'onclinic-cherkasy', 'onclinic-kharkiv');

-- 4. checkup_channel_checked_at не заповнюється: дату ставить ДАНІ після підтвердження каналу Ігорем.

commit;

-- Перевірка після запуску (live 25.11: checkup_capable – 14 рядків: 11 onclinic-* міст, credoclinic, rokl, symbiotyka;
--   checkup_reviewer = 'agreed' – 4 рядки; checkup_channel_checked_at – 0):
--   select slug, checkup_capable, checkup_reviewer, checkup_channel_checked_at
--   from public.clinics
--   where checkup_capable or checkup_reviewer is not null
--   order by slug;
--
-- Відкат (оборотний, колонки нові):
--   alter table public.clinics
--     drop constraint if exists clinics_checkup_reviewer_check,
--     drop column if exists checkup_capable,
--     drop column if exists checkup_channel_checked_at,
--     drop column if exists checkup_reviewer;
