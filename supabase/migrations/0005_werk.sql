-- Fase 4: werkcategorieën, taken (met subtaken en herhaling), LinkedIn-ideeën
-- en notities, plus de linkedin-images bucket.

alter table user_settings
  add column work_categories_seeded boolean not null default false,
  add column sample_work_seeded boolean not null default false;

-- work_categories -------------------------------------------------------------

create table work_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table work_categories enable row level security;

create policy "eigenaar kan eigen werkcategorieën beheren"
  on work_categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on work_categories
  for each row execute function set_updated_at();

-- work_tasks --------------------------------------------------------------------

create table work_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  deadline date,
  priority text not null default 'normaal' check (priority in ('hoog', 'normaal', 'laag')),
  category_id uuid references work_categories (id) on delete set null,
  parent_task_id uuid references work_tasks (id) on delete cascade,
  completed_at timestamptz,
  recurrence_type text not null default 'geen' check (
    recurrence_type in ('geen', 'dagelijks', 'wekelijks', 'maandelijks')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index work_tasks_parent_idx on work_tasks (parent_task_id);

alter table work_tasks enable row level security;

create policy "eigenaar kan eigen taken beheren"
  on work_tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on work_tasks
  for each row execute function set_updated_at();

-- linkedin_ideas ------------------------------------------------------------------

create table linkedin_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  hook text,
  body text,
  tags text[] not null default '{}',
  status text not null default 'idee' check (
    status in ('idee', 'concept', 'gepland', 'gepubliceerd')
  ),
  planned_date date,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table linkedin_ideas enable row level security;

create policy "eigenaar kan eigen linkedin-ideeën beheren"
  on linkedin_ideas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on linkedin_ideas
  for each row execute function set_updated_at();

-- work_notes -----------------------------------------------------------------------

create table work_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table work_notes enable row level security;

create policy "eigenaar kan eigen notities beheren"
  on work_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on work_notes
  for each row execute function set_updated_at();

-- storage: linkedin-afbeeldingen (privé, per gebruiker eigen map) -------------------

insert into storage.buckets (id, name, public)
values ('linkedin-images', 'linkedin-images', false)
on conflict (id) do nothing;

create policy "eigenaar kan eigen linkedin-afbeeldingen lezen"
  on storage.objects
  for select
  using (bucket_id = 'linkedin-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen linkedin-afbeeldingen uploaden"
  on storage.objects
  for insert
  with check (bucket_id = 'linkedin-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen linkedin-afbeeldingen verwijderen"
  on storage.objects
  for delete
  using (bucket_id = 'linkedin-images' and (storage.foldername(name))[1] = auth.uid()::text);
