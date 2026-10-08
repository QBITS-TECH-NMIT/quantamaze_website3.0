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
  track text,
  result_rank integer not null default 1 check (result_rank > 0),
  status text not null check (status in ('selected', 'waiting_list')),
  created_at timestamptz not null default now()
);

alter table public.phase_one_results
  add column if not exists track text,
  add column if not exists result_rank integer,
  drop column if exists members;

with ranked_results as (
  select id, row_number() over (order by created_at asc, id asc)::integer as result_rank
  from public.phase_one_results
)
update public.phase_one_results as results
set result_rank = ranked_results.result_rank
from ranked_results
where results.id = ranked_results.id
  and results.result_rank is null;

alter table public.phase_one_results
  alter column result_rank set default 1,
  alter column result_rank set not null;

create or replace function public.maintain_phase_one_result_ranks()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    update public.phase_one_results
    set result_rank = result_rank + 1
    where result_rank >= new.result_rank;
    return new;
  elsif tg_op = 'UPDATE' then
    if new.result_rank < old.result_rank then
      update public.phase_one_results
      set result_rank = result_rank + 1
      where result_rank >= new.result_rank
        and result_rank < old.result_rank
        and id <> new.id;
    elsif new.result_rank > old.result_rank then
      update public.phase_one_results
      set result_rank = result_rank - 1
      where result_rank > old.result_rank
        and result_rank <= new.result_rank
        and id <> new.id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    update public.phase_one_results
    set result_rank = result_rank - 1
    where result_rank > old.result_rank;
    return old;
  end if;

  return null;
end;
$$;

revoke all on function public.maintain_phase_one_result_ranks() from public, anon, authenticated;
grant execute on function public.maintain_phase_one_result_ranks() to service_role;

drop trigger if exists phase_one_results_maintain_ranks on public.phase_one_results;
create trigger phase_one_results_maintain_ranks
  before insert or update of result_rank or delete
  on public.phase_one_results
  for each row execute function public.maintain_phase_one_result_ranks();

create unique index if not exists phase_one_results_name_unique
  on public.phase_one_results (lower(name));

alter table public.phase_one_results enable row level security;
revoke all on table public.phase_one_results from anon, authenticated;
grant all on table public.phase_one_results to service_role;
