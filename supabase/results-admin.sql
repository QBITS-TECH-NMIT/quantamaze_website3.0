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
  result_rank integer not null default 1,
  constraint phase_one_results_rank_check check (result_rank between 1 and 15),
  status text not null check (status in ('selected', 'waiting_list')),
  created_at timestamptz not null default now()
);

alter table public.phase_one_results
  add column if not exists track text,
  add column if not exists result_rank integer,
  drop column if exists members;

drop trigger if exists phase_one_results_maintain_ranks on public.phase_one_results;

do $$
begin
  if exists (
    select 1
    from public.phase_one_results
    group by track
    having count(*) > 15
  ) then
    raise exception 'Each track can contain at most 15 ranked teams; remove or reassign extra teams before applying this migration.';
  end if;
end $$;

with ranked_results as (
  select id, row_number() over (
    partition by track
    order by result_rank, created_at asc, id asc
  )::integer as result_rank
  from public.phase_one_results
)
update public.phase_one_results as results
set result_rank = ranked_results.result_rank
from ranked_results
where results.id = ranked_results.id
  and results.result_rank is distinct from ranked_results.result_rank;

alter table public.phase_one_results
  alter column result_rank set default 1,
  alter column result_rank set not null,
  drop constraint if exists phase_one_results_result_rank_check,
  drop constraint if exists phase_one_results_rank_check,
  add constraint phase_one_results_rank_check check (result_rank between 1 and 15);

create or replace function public.maintain_phase_one_result_ranks()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_track_count integer;
begin
  if pg_trigger_depth() > 1 then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    select count(*) into current_track_count
    from public.phase_one_results
    where track is not distinct from new.track;

    if current_track_count >= 15 then
      raise exception 'A track can contain at most 15 teams.';
    end if;

    new.result_rank := least(new.result_rank, current_track_count + 1);
    if new.result_rank <= current_track_count then
      update public.phase_one_results
      set result_rank = result_rank + 1
      where track is not distinct from new.track
        and result_rank >= new.result_rank;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if new.track is not distinct from old.track then
      select count(*) into current_track_count
      from public.phase_one_results
      where track is not distinct from old.track;

      new.result_rank := least(new.result_rank, current_track_count);
      if new.result_rank < old.result_rank then
        update public.phase_one_results
        set result_rank = result_rank + 1
        where track is not distinct from old.track
          and result_rank >= new.result_rank
          and result_rank < old.result_rank
          and id <> new.id;
      elsif new.result_rank > old.result_rank then
        update public.phase_one_results
        set result_rank = result_rank - 1
        where track is not distinct from old.track
          and result_rank > old.result_rank
          and result_rank <= new.result_rank
          and id <> new.id;
      end if;
    else
      select count(*) into current_track_count
      from public.phase_one_results
      where track is not distinct from new.track;

      if current_track_count >= 15 then
        raise exception 'A track can contain at most 15 teams.';
      end if;

      new.result_rank := least(new.result_rank, current_track_count + 1);
      update public.phase_one_results
      set result_rank = result_rank - 1
      where track is not distinct from old.track
        and result_rank > old.result_rank
        and id <> new.id;
      update public.phase_one_results
      set result_rank = result_rank + 1
      where track is not distinct from new.track
        and result_rank >= new.result_rank;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    update public.phase_one_results
    set result_rank = result_rank - 1
    where track is not distinct from old.track
      and result_rank > old.result_rank;
    return old;
  end if;

  return null;
end;
$$;

revoke all on function public.maintain_phase_one_result_ranks() from public, anon, authenticated;
grant execute on function public.maintain_phase_one_result_ranks() to service_role;

drop trigger if exists phase_one_results_maintain_ranks on public.phase_one_results;
create trigger phase_one_results_maintain_ranks
  before insert or update of track, result_rank or delete
  on public.phase_one_results
  for each row execute function public.maintain_phase_one_result_ranks();

drop index if exists public.phase_one_results_rank_idx;
drop index if exists public.phase_one_results_status_rank_idx;

create index phase_one_results_rank_idx
  on public.phase_one_results (track, result_rank, created_at, id);

create index phase_one_results_status_rank_idx
  on public.phase_one_results (status, track, result_rank, created_at, id);

create unique index if not exists phase_one_results_name_unique
  on public.phase_one_results (lower(name));

alter table public.phase_one_results enable row level security;
revoke all on table public.phase_one_results from anon, authenticated;
grant all on table public.phase_one_results to service_role;
