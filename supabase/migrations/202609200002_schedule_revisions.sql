create table public.schedule_revisions (id uuid primary key default gen_random_uuid(),schedule_id uuid not null references public.schedules on delete cascade,revision integer not null,published_at timestamptz not null default now(),published_by uuid not null references public.profiles,snapshot jsonb not null,unique(schedule_id,revision));
alter table public.schedule_revisions enable row level security;
create policy "published revisions visible" on public.schedule_revisions for select using(public.is_manager() or exists(select 1 from public.schedules s where s.id=schedule_id and s.status in('published','revised')));
create policy "managers create revisions" on public.schedule_revisions for insert with check(public.is_manager());
