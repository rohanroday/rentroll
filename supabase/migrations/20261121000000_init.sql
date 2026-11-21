-- RentRoll version 1 schema.
-- Every table is scoped to one landlord account and protected by row level security.
-- Payments can only be written through the record_payment and undo_payment functions.

create schema if not exists private;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.members (
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('full', 'view')),
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  role text not null check (role in ('full', 'view')),
  token_hash text not null unique,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index invites_one_open on public.invites (account_id, lower(email)) where accepted_at is null;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  address text check (char_length(address) <= 200),
  created_at timestamptz not null default now(),
  unique (id, account_id),
  unique (account_id, name)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  property_id uuid not null,
  label text not null check (char_length(label) between 1 and 12),
  created_at timestamptz not null default now(),
  unique (id, account_id),
  unique (property_id, label),
  foreign key (property_id, account_id) references public.properties (id, account_id) on delete cascade
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  room_id uuid not null,
  name text not null check (char_length(name) between 1 and 60),
  phone text check (phone ~ '^[6-9][0-9]{9}$'),
  email text check (email is null or position('@' in email) > 1),
  rent integer not null check (rent between 1 and 10000000),
  due_day integer not null check (due_day between 1 and 31),
  next_due date not null,
  paid_so_far integer not null default 0,
  ended_on date,
  created_at timestamptz not null default now(),
  unique (id, account_id),
  check (paid_so_far >= 0 and paid_so_far < rent),
  foreign key (room_id, account_id) references public.rooms (id, account_id) on delete cascade
);
create unique index tenants_one_per_room on public.tenants (room_id) where ended_on is null;
create index tenants_account_due on public.tenants (account_id, next_due) where ended_on is null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  tenant_id uuid not null,
  tenant_name text not null,
  room_label text not null,
  rent integer not null,
  was_due date not null,
  next_due date not null,
  paid_before integer not null,
  amount integer not null check (amount > 0),
  balance_left integer not null check (balance_left >= 0),
  method text not null check (method in ('upi', 'cash', 'bank', 'other')),
  paid_on date not null,
  source text not null default 'app' check (source in ('app', 'email')),
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_by_email text,
  voided_at timestamptz,
  voided_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, account_id) references public.tenants (id, account_id) on delete cascade
);
create index payments_account_paid_on on public.payments (account_id, paid_on desc);
create index payments_tenant on public.payments (tenant_id, created_at desc);

create table public.reminder_log (
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  sent_on date not null,
  primary key (account_id, user_id, sent_on)
);

-- Access helpers
create function private.my_account_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select account_id from public.members where user_id = auth.uid()
$$;

create function private.can_edit(a uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.members
    where account_id = a and user_id = auth.uid() and role = 'full'
  )
$$;

create function private.is_owner(a uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.accounts where id = a and owner_id = auth.uid())
$$;

-- Same day next month, using the last day of a shorter month.
create function private.next_rent_due(d date, due_day integer) returns date
language sql immutable set search_path = '' as $$
  select (date_trunc('month', d::timestamp) + interval '1 month')::date
    + (least(
        due_day,
        extract(day from date_trunc('month', d::timestamp) + interval '2 months' - interval '1 day')::integer
      ) - 1)
$$;

-- Privileges: start from nothing, then grant only what each table needs.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.my_account_id() to authenticated;
grant execute on function private.can_edit(uuid) to authenticated;
grant execute on function private.is_owner(uuid) to authenticated;

grant select on public.accounts, public.members, public.properties, public.rooms, public.tenants, public.payments to authenticated;
grant update (name) on public.accounts to authenticated;
grant update (role), delete on public.members to authenticated;
grant select (id, account_id, email, role, expires_at, accepted_at, created_at), insert, delete on public.invites to authenticated;
grant insert, update (name, address) on public.properties to authenticated;
grant insert, update (label), delete on public.rooms to authenticated;
grant insert (account_id, room_id, name, phone, email, rent, due_day, next_due),
      update (name, phone, email, rent, due_day, next_due, ended_on) on public.tenants to authenticated;
grant all on public.reminder_log to service_role;

alter table public.accounts enable row level security;
alter table public.members enable row level security;
alter table public.invites enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.payments enable row level security;
alter table public.reminder_log enable row level security;

create policy "members read account" on public.accounts for select to authenticated
  using (id = (select private.my_account_id()));
create policy "owner renames account" on public.accounts for update to authenticated
  using (private.is_owner(id)) with check (private.is_owner(id));

create policy "members read team" on public.members for select to authenticated
  using (account_id = (select private.my_account_id()));
create policy "owner changes team roles" on public.members for update to authenticated
  using (private.is_owner(account_id) and user_id <> (select auth.uid()))
  with check (private.is_owner(account_id) and user_id <> (select auth.uid()));
create policy "owner removes team members" on public.members for delete to authenticated
  using (private.is_owner(account_id) and user_id <> (select auth.uid()));

create policy "owner reads invites" on public.invites for select to authenticated
  using (private.is_owner(account_id));
create policy "owner creates invites" on public.invites for insert to authenticated
  with check (private.is_owner(account_id));
create policy "owner deletes invites" on public.invites for delete to authenticated
  using (private.is_owner(account_id));

create policy "members read properties" on public.properties for select to authenticated
  using (account_id = (select private.my_account_id()));
create policy "full access adds properties" on public.properties for insert to authenticated
  with check (private.can_edit(account_id));
create policy "full access edits properties" on public.properties for update to authenticated
  using (private.can_edit(account_id)) with check (private.can_edit(account_id));

create policy "members read rooms" on public.rooms for select to authenticated
  using (account_id = (select private.my_account_id()));
create policy "full access adds rooms" on public.rooms for insert to authenticated
  with check (private.can_edit(account_id));
create policy "full access edits rooms" on public.rooms for update to authenticated
  using (private.can_edit(account_id)) with check (private.can_edit(account_id));
create policy "full access deletes empty rooms" on public.rooms for delete to authenticated
  using (private.can_edit(account_id));

create policy "members read tenants" on public.tenants for select to authenticated
  using (account_id = (select private.my_account_id()));
create policy "full access adds tenants" on public.tenants for insert to authenticated
  with check (private.can_edit(account_id));
create policy "full access edits tenants" on public.tenants for update to authenticated
  using (private.can_edit(account_id)) with check (private.can_edit(account_id));

create policy "members read payments" on public.payments for select to authenticated
  using (account_id = (select private.my_account_id()));

-- First-time setup: creates the account, its owner and the first property together.
create function public.create_account(p_property text, p_address text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_email text := auth.jwt() ->> 'email';
  v_account uuid;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from public.members where user_id = v_uid) then
    raise exception 'already_in_account';
  end if;
  insert into public.accounts (name, owner_id) values (trim(p_property), v_uid) returning id into v_account;
  insert into public.members (account_id, user_id, email, role) values (v_account, v_uid, v_email, 'full');
  insert into public.properties (account_id, name, address)
    values (v_account, trim(p_property), nullif(trim(coalesce(p_address, '')), ''));
  return v_account;
end $$;

-- Records a full or part payment. The expected values stop double taps and stale pages.
create function public.record_payment(
  p_tenant uuid, p_amount integer, p_expected_due date, p_expected_paid integer,
  p_method text, p_paid_on date, p_source text default 'app'
) returns public.payments language plpgsql security definer set search_path = '' as $$
declare
  t public.tenants;
  v_label text;
  v_balance integer;
  v_left integer;
  v_next date;
  v_row public.payments;
begin
  select * into t from public.tenants where id = p_tenant for update;
  if not found or not private.can_edit(t.account_id) then raise exception 'not_allowed'; end if;
  if t.ended_on is not null then raise exception 'moved_out'; end if;
  if t.next_due <> p_expected_due or t.paid_so_far <> p_expected_paid then
    raise exception 'already_recorded';
  end if;
  v_balance := t.rent - t.paid_so_far;
  if p_amount is null or p_amount < 1 or p_amount > v_balance then raise exception 'bad_amount'; end if;
  if p_paid_on > (now() at time zone 'Asia/Kolkata')::date then raise exception 'future_date'; end if;

  v_left := v_balance - p_amount;
  v_next := case when v_left = 0 then private.next_rent_due(t.next_due, t.due_day) else t.next_due end;
  select label into v_label from public.rooms where id = t.room_id;

  insert into public.payments (
    account_id, tenant_id, tenant_name, room_label, rent, was_due, next_due, paid_before,
    amount, balance_left, method, paid_on, source, recorded_by, recorded_by_email
  ) values (
    t.account_id, t.id, t.name, v_label, t.rent, t.next_due, v_next, t.paid_so_far,
    p_amount, v_left, p_method, p_paid_on, p_source, auth.uid(), auth.jwt() ->> 'email'
  ) returning * into v_row;

  update public.tenants
  set next_due = v_next, paid_so_far = case when v_left = 0 then 0 else t.paid_so_far + p_amount end
  where id = t.id;
  return v_row;
end $$;

-- Undoes a tenant's most recent payment and restores their balance and due date.
create function public.undo_payment(p_payment uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  p public.payments;
  t public.tenants;
begin
  select * into p from public.payments where id = p_payment;
  if not found or not private.can_edit(p.account_id) then raise exception 'not_allowed'; end if;
  select * into t from public.tenants where id = p.tenant_id for update;
  select * into p from public.payments where id = p_payment for update;
  if p.voided_at is not null then raise exception 'already_undone'; end if;
  if exists (
    select 1 from public.payments
    where tenant_id = p.tenant_id and voided_at is null and created_at > p.created_at
  ) then raise exception 'not_latest'; end if;
  if p.paid_before >= t.rent then raise exception 'rent_changed'; end if;

  update public.payments set voided_at = now(), voided_by = auth.uid() where id = p.id;
  update public.tenants set next_due = p.was_due, paid_so_far = p.paid_before where id = t.id;
end $$;

-- Joins a landlord's team. The invite must match this person's confirmed email.
create function public.accept_invite(p_hash text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  i public.invites;
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  select email into v_email from auth.users where id = v_uid and email_confirmed_at is not null;
  if v_email is null then raise exception 'email_not_confirmed'; end if;
  select * into i from public.invites where token_hash = p_hash for update;
  if not found or i.accepted_at is not null or i.expires_at < now() then raise exception 'invite_invalid'; end if;
  if lower(i.email) <> lower(v_email) then raise exception 'invite_wrong_email'; end if;
  if exists (select 1 from public.members where user_id = v_uid) then raise exception 'already_in_account'; end if;
  insert into public.members (account_id, user_id, email, role) values (i.account_id, v_uid, v_email, i.role);
  update public.invites set accepted_at = now() where id = i.id;
  return i.account_id;
end $$;

revoke all on function public.create_account(text, text) from public, anon;
revoke all on function public.record_payment(uuid, integer, date, integer, text, date, text) from public, anon;
revoke all on function public.undo_payment(uuid) from public, anon;
revoke all on function public.accept_invite(text) from public, anon;
grant execute on function public.create_account(text, text) to authenticated;
grant execute on function public.record_payment(uuid, integer, date, integer, text, date, text) to authenticated;
grant execute on function public.undo_payment(uuid) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
