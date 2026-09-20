alter table profiles add column if not exists username text;

update profiles
set username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9._-]', '', 'g'))
where role = 'employee' and username is null;

create unique index if not exists profiles_username_unique
on profiles (lower(username))
where username is not null;

alter table profiles add constraint employee_username_required
check (role <> 'employee' or username is not null) not valid;
