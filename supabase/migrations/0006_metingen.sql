-- Fase 5: lichaamsmetingen (gewicht, vetpercentage, omtrekken) en
-- progressiefoto's, plus de progress-photos bucket.

alter table user_settings
  add column sample_measurements_seeded boolean not null default false;

-- body_measurements -------------------------------------------------------------

create table body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_at date not null,
  weight_kg numeric check (weight_kg > 0),
  body_fat_percentage numeric check (body_fat_percentage > 0 and body_fat_percentage <= 100),
  waist_cm numeric check (waist_cm > 0),
  chest_cm numeric check (chest_cm > 0),
  hips_cm numeric check (hips_cm > 0),
  arm_cm numeric check (arm_cm > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, measured_at)
);

alter table body_measurements enable row level security;

create policy "eigenaar kan eigen metingen beheren"
  on body_measurements
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on body_measurements
  for each row execute function set_updated_at();

-- progress_photos -----------------------------------------------------------------

create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  taken_at date not null,
  photo_path text not null,
  weight_kg numeric check (weight_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index progress_photos_taken_at_idx on progress_photos (user_id, taken_at desc);

alter table progress_photos enable row level security;

create policy "eigenaar kan eigen progressiefoto's beheren"
  on progress_photos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on progress_photos
  for each row execute function set_updated_at();

-- storage: progressiefoto's (privé, per gebruiker eigen map) -----------------------

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "eigenaar kan eigen progressiefoto's lezen"
  on storage.objects
  for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen progressiefoto's uploaden"
  on storage.objects
  for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen progressiefoto's verwijderen"
  on storage.objects
  for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
