create or replace function enforce_rest_day_request_limit() returns trigger
language plpgsql
as $$
begin
  if new.status in ('pending', 'approved') then
    perform pg_advisory_xact_lock(hashtext(new.requested_date::text));
    if (
      select count(*)
      from rest_day_requests
      where requested_date = new.requested_date
        and status in ('pending', 'approved')
        and id <> new.id
    ) >= 3 then
      raise exception 'REST_DAY_LIMIT_REACHED';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists rest_day_request_limit on rest_day_requests;
create trigger rest_day_request_limit
before insert or update of requested_date, status on rest_day_requests
for each row execute function enforce_rest_day_request_limit();
