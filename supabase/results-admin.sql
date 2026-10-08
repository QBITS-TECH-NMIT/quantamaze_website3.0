do $$
begin
  if to_regclass('public.phase_one_results') is null
    and to_regclass('public.phase_two_results') is not null then
    alter table public.phase_two_results rename to phase_one_results;
  end if;

  if to_regclass('public.phase_one_results_name_unique') is null
    and to_regclass('public.phase_two_results_name_unique') is not null then
    alter index public.phase_two_results_name_unique rename to phase_one_results_name_unique;
  end if;
end $$;

create table if not exists public.phase_one_results (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  team_lead_name text not null check (char_length(trim(team_lead_name)) between 1 and 60),
  status text not null check (status in ('selected', 'waiting_list')),
  created_at timestamptz not null default now()
);

create unique index if not exists phase_one_results_name_unique
  on public.phase_one_results (lower(name));

alter table public.phase_one_results enable row level security;
revoke all on table public.phase_one_results from anon, authenticated;
grant all on table public.phase_one_results to service_role;
