-- Voorkomt dubbele voorbeelddata: een aparte vlag om het seeden van de
-- voorbeeldrecepten atomair te claimen (zie lib/data/voeding.ts).

alter table user_settings
  add column sample_recipes_seeded boolean not null default false;
