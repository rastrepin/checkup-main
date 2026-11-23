-- Пакет 2, крок 1: набори за системами організму (my-plan v0.8.2 §8, age-page-zones v0.9.3 §4.1; DATABASE.md §6.8).
-- Три нові таблиці з RLS. Наявні таблиці не змінюються, на сайті нічого не змінюється: таблиці порожні.
-- Дані вносить Дует (рецензенти: Балан – жіночі набори, Мельник – чоловічі). Запуск у базі – лише після «так» Ігоря на PR.

-- 1. Системи організму
create table public.body_systems (
  code text primary key check (code ~ '^[a-z0-9-]+$'),                    -- cardio, reproductive, endocrine…
  name_ua text not null check (char_length(name_ua) <= 40),
  purpose_ua text check (char_length(purpose_ua) <= 80),
  gender_scope text not null default 'any'
    check (gender_scope in ('any', 'female', 'male')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Базовий і розширений набір системи
create table public.system_sets (
  id uuid primary key default gen_random_uuid(),
  system_code text not null references public.body_systems(code) on update cascade,
  level text not null check (level in ('base', 'extended')),
  gender_scope text not null default 'any'
    check (gender_scope in ('any', 'female', 'male')),
  min_age smallint check (min_age between 0 and 120),                      -- порожньо – без межі
  max_age smallint check (max_age between 0 and 120),
  reviewed_by text,                                                        -- рецензент
  reviewed_at date,                                                        -- без дати набір не показується
  approved_at date,                                                        -- погодження Ігоря; без дати не показується
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (min_age is null or max_age is null or min_age <= max_age),
  unique nulls not distinct (system_code, level, gender_scope, min_age, max_age)
);

-- 3. Склад набору. Розширений містить усі свої дослідження, разом з базовими.
create table public.system_set_items (
  set_id uuid not null references public.system_sets(id) on delete cascade,
  examination_slug text not null
    references public.examinations(slug) on update cascade on delete cascade,
  purpose_label_ua text check (char_length(purpose_label_ua) <= 60),       -- «оцінка функції печінки»
  sort_order integer not null default 0,
  primary key (set_id, examination_slug)
);
create index system_set_items_exam_idx on public.system_set_items (examination_slug);

alter table public.body_systems enable row level security;
alter table public.system_sets enable row level security;
alter table public.system_set_items enable row level security;

create policy "Public read body_systems" on public.body_systems
  for select using (is_active);
create policy "Public read approved system_sets" on public.system_sets
  for select using (is_active and reviewed_at is not null and approved_at is not null);
-- Склад – лише для наборів, які видно (та сама умова, що в політиці system_sets).
create policy "Public read items of visible system_sets" on public.system_set_items
  for select using (
    exists (
      select 1 from public.system_sets s
      where s.id = set_id and s.is_active and s.reviewed_at is not null and s.approved_at is not null
    )
  );
-- Запис – лише власником проєкту (Table Editor Supabase) і міграціями. Політик insert/update немає.

-- Відкат (оборотний, таблиці порожні): drop table public.system_set_items, public.system_sets, public.body_systems;
