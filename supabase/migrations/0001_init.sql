-- Fase 1: basistabellen voor dagelijkse taken, kaartvoorkeuren, gebruikersdoelen en de inbox.

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- daily_task_definitions ----------------------------------------------------

create table daily_task_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null check (category in ('supplement', 'verzorging', 'eigen')),
  frequency_type text not null check (frequency_type in ('daily', 'specific_days', 'every_x_days')),
  specific_days smallint[],
  every_x_days smallint,
  anchor_date date not null default current_date,
  reminder_time time,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table daily_task_definitions enable row level security;

create policy "eigenaar kan eigen dagelijkse taken beheren"
  on daily_task_definitions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on daily_task_definitions
  for each row execute function set_updated_at();

-- daily_task_logs ------------------------------------------------------------

create table daily_task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_definition_id uuid not null references daily_task_definitions (id) on delete cascade,
  completed_date date not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_definition_id, completed_date)
);

alter table daily_task_logs enable row level security;

create policy "eigenaar kan eigen afvinkregistraties beheren"
  on daily_task_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on daily_task_logs
  for each row execute function set_updated_at();

-- dashboard_card_prefs --------------------------------------------------------

create table dashboard_card_prefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_key text not null check (card_key in ('voeding', 'sport', 'werk', 'verzorging', 'gewicht')),
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_key)
);

alter table dashboard_card_prefs enable row level security;

create policy "eigenaar kan eigen kaartvoorkeuren beheren"
  on dashboard_card_prefs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on dashboard_card_prefs
  for each row execute function set_updated_at();

-- user_settings ---------------------------------------------------------------

create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  calorie_goal int not null default 2400,
  protein_goal_g int not null default 180,
  carbs_goal_g int,
  fat_goal_g int,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table user_settings enable row level security;

create policy "eigenaar kan eigen instellingen beheren"
  on user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on user_settings
  for each row execute function set_updated_at();

-- inbox_notes -------------------------------------------------------------------

create table inbox_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  is_processed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table inbox_notes enable row level security;

create policy "eigenaar kan eigen inbox beheren"
  on inbox_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on inbox_notes
  for each row execute function set_updated_at();
