-- Fase 2: producten, recepten, voedingsdagboek en de receptfoto-bucket.

-- products -------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('off', 'custom')),
  off_barcode text,
  name text not null,
  brand text,
  calories_per_100g numeric not null,
  protein_per_100g numeric not null,
  carbs_per_100g numeric not null,
  fat_per_100g numeric not null,
  default_portion_g numeric,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index products_user_barcode_key
  on products (user_id, off_barcode)
  where off_barcode is not null;

alter table products enable row level security;

create policy "eigenaar kan eigen producten beheren"
  on products
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- recipes ----------------------------------------------------------------------

create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  photo_path text,
  instructions text,
  servings int not null default 1 check (servings > 0),
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recipes enable row level security;

create policy "eigenaar kan eigen recepten beheren"
  on recipes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- recipe_ingredients ---------------------------------------------------------

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references recipes (id) on delete cascade,
  product_id uuid not null references products (id) on delete restrict,
  quantity_g numeric not null check (quantity_g > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recipe_ingredients enable row level security;

create policy "eigenaar kan eigen receptingredienten beheren"
  on recipe_ingredients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on recipe_ingredients
  for each row execute function set_updated_at();

-- food_diary_entries -----------------------------------------------------------

create table food_diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  meal_type text not null check (meal_type in ('ontbijt', 'lunch', 'diner', 'snack')),
  logged_at timestamptz not null default now(),
  source_type text not null check (source_type in ('product', 'recipe')),
  product_id uuid references products (id) on delete set null,
  recipe_id uuid references recipes (id) on delete set null,
  quantity_g numeric,
  servings numeric,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_diary_entries_source_check check (
    (source_type = 'product' and product_id is not null and quantity_g is not null)
    or
    (source_type = 'recipe' and recipe_id is not null and servings is not null)
  )
);

create index food_diary_entries_user_date_idx on food_diary_entries (user_id, entry_date);

alter table food_diary_entries enable row level security;

create policy "eigenaar kan eigen dagboekregels beheren"
  on food_diary_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on food_diary_entries
  for each row execute function set_updated_at();

-- storage: receptfoto's (privé, per gebruiker eigen map) -----------------------

insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', false)
on conflict (id) do nothing;

create policy "eigenaar kan eigen receptfoto's lezen"
  on storage.objects
  for select
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen receptfoto's uploaden"
  on storage.objects
  for insert
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "eigenaar kan eigen receptfoto's verwijderen"
  on storage.objects
  for delete
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
