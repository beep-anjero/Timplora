create table schedule_revisions(id uuid primary key default gen_random_uuid(),schedule_id uuid not null references schedules on delete cascade,revision integer not null,published_at timestamptz not null default now(),published_by text not null references profiles,snapshot jsonb not null,unique(schedule_id,revision));
alter table schedule_revisions enable row level security;
create policy revisions_read on schedule_revisions for select to authenticated using(is_manager() or exists(select 1 from schedules where schedules.id=schedule_id and status in('published','revised')));
create policy revisions_create on schedule_revisions for insert to authenticated with check(is_manager());
grant select,insert on schedule_revisions to authenticated;
