-- Lets the daily reminder job read what it needs to build each landlord's email.
grant usage on schema public to service_role;
grant select on public.accounts, public.members, public.properties, public.rooms, public.tenants to service_role;
grant select, insert, delete on public.reminder_log to service_role;
