-- Fase 3: oefeningen, schema's, workoutsessies en -sets.

alter table user_settings
  add column sample_sport_seeded boolean not null default false;

-- exercises -----------------------------------------------------------------

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text not null check (
    muscle_group in ('borst', 'rug', 'benen', 'schouders', 'armen', 'buik')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table exercises enable row level security;

create policy "eigenaar kan eigen oefeningen beheren"
  on exercises
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on exercises
  for each row execute function set_updated_at();

-- workout_schedules -----------------------------------------------------------

create table workout_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workout_schedules enable row level security;

create policy "eigenaar kan eigen schema's beheren"
  on workout_schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on workout_schedules
  for each row execute function set_updated_at();

-- schedule_exercises ------------------------------------------------------------

create table schedule_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule_id uuid not null references workout_schedules (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  sort_order int not null default 0,
  target_sets int not null check (target_sets > 0),
  target_reps text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table schedule_exercises enable row level security;

create policy "eigenaar kan eigen schema-oefeningen beheren"
  on schedule_exercises
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on schedule_exercises
  for each row execute function set_updated_at();

-- workout_sessions -----------------------------------------------------------------

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule_id uuid references workout_schedules (id) on delete set null,
  title text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workout_sessions enable row level security;

create policy "eigenaar kan eigen workoutsessies beheren"
  on workout_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on workout_sessions
  for each row execute function set_updated_at();

-- workout_sets -----------------------------------------------------------------------

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references workout_sessions (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  set_number int not null check (set_number > 0),
  weight_kg numeric not null check (weight_kg >= 0),
  reps int not null check (reps > 0),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workout_sets_exercise_idx on workout_sets (user_id, exercise_id, completed_at desc);

alter table workout_sets enable row level security;

create policy "eigenaar kan eigen sets beheren"
  on workout_sets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on workout_sets
  for each row execute function set_updated_at();
