alter table scheduling_settings
add column if not exists minimum_daily_crew integer not null default 4 check (minimum_daily_crew between 1 and 50);

insert into scheduling_settings(id,week_starts,finalization_weekday,minimum_daily_crew)
values(true,1,5,4)
on conflict(id) do nothing;

insert into shift_templates(name,starts_at,ends_at,break_minutes) values
  ('Early','04:00','13:00',60),
  ('Early 2','05:00','14:00',60),
  ('Day','08:00','16:00',60),
  ('Day 2','09:00','18:00',60),
  ('Swing','11:00','20:00',60),
  ('Late','14:00','22:00',60),
  ('Closing','16:00','01:00',60)
on conflict(name) do nothing;
