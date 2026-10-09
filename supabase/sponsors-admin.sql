create table if not exists public.site_sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  tier_id text not null check (
    tier_id in ('title', 'gold', 'inkind', 'vc', 'event', 'platform', 'credentials')
  ),
  url text not null check (char_length(trim(url)) between 1 and 2048),
  logo_url text not null check (char_length(trim(logo_url)) between 1 and 2048),
  created_at timestamptz not null default now()
);

create index if not exists site_sponsors_tier_created_idx
  on public.site_sponsors (tier_id, created_at, id);

alter table public.site_sponsors enable row level security;
revoke all on table public.site_sponsors from anon, authenticated;
grant all on table public.site_sponsors to service_role;
