create table if not exists public.inauguration_state (
  room_id text not null default 'qam3',
  state_key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (room_id, state_key),
  constraint inauguration_state_room_check check (room_id = 'qam3'),
  constraint inauguration_state_key_check check (
    state_key in ('phase', 'count')
    or state_key ~ '^(p|names|c)/[1-5]$'
  ),
  constraint inauguration_state_value_check check (
    (state_key = 'phase' and value in ('"idle"'::jsonb, '"open"'::jsonb, '"lit"'::jsonb, '"welcome"'::jsonb))
    or (
      state_key = 'count'
      and case
        when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric between 0 and 5
        else false
      end
    )
    or (
      state_key ~ '^p/[1-5]$'
      and jsonb_typeof(value) = 'object'
      and value ?& array['h', 't']
      and value->'h' in ('0'::jsonb, '1'::jsonb)
      and jsonb_typeof(value->'t') = 'number'
      and value - 'h' - 't' = '{}'::jsonb
    )
    or (
      state_key ~ '^names/[1-5]$'
      and case
        when jsonb_typeof(value) = 'string' then char_length(value #>> '{}') <= 80
        else false
      end
    )
    or (
      state_key ~ '^c/[1-5]$'
      and jsonb_typeof(value) = 'number'
    )
  )
);

alter table public.inauguration_state enable row level security;
alter table public.inauguration_state replica identity full;

revoke all on table public.inauguration_state from anon, authenticated;
grant select, insert, update, delete on table public.inauguration_state to anon;

drop policy if exists inauguration_state_public_room on public.inauguration_state;
create policy inauguration_state_public_room
  on public.inauguration_state
  for all
  to anon
  using (room_id = 'qam3')
  with check (room_id = 'qam3');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inauguration_state'
  ) then
    execute 'alter publication supabase_realtime add table public.inauguration_state';
  end if;
end
$$;
