-- Tenant reminders, private payment links, and owner approval of reported payments.
-- Tenants never log in. Their pages run on the server through functions only the service role can call.

alter table public.accounts
  add column upi_id text check (upi_id is null or upi_id ~ '^[A-Za-z0-9._-]{2,128}@[A-Za-z0-9]{2,64}$'),
  add column upi_name text check (upi_name is null or char_length(upi_name) between 1 and 60);
grant update (upi_id, upi_name) on public.accounts to authenticated;

alter table public.tenants
  add column reminders_enabled boolean not null default false,
  add column reminders_opted_out_at timestamptz,
  add constraint tenants_reminders_need_email check (not reminders_enabled or email is not null),
  add constraint tenants_reminders_respect_opt_out check (not (reminders_enabled and reminders_opted_out_at is not null));
grant update (reminders_enabled) on public.tenants to authenticated;

alter table public.payments drop constraint payments_source_check;
alter table public.payments add constraint payments_source_check check (source in ('app', 'email', 'tenant'));

create table public.payment_links (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  tenant_id uuid not null,
  token_hash text not null unique,
  due date not null,
  expires_at timestamptz not null default now() + interval '45 days',
  created_at timestamptz not null default now(),
  foreign key (tenant_id, account_id) references public.tenants (id, account_id) on delete cascade
);
create index payment_links_tenant on public.payment_links (tenant_id, due);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  tenant_id uuid not null,
  due date not null,
  expected_paid integer not null,
  amount integer not null check (amount > 0),
  method text not null check (method in ('upi', 'cash')),
  utr text check (utr is null or utr ~ '^[0-9]{12}$'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'undone')),
  reject_reason text check (char_length(reject_reason) <= 200),
  payment_id uuid references public.payments (id) on delete set null,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check ((method = 'upi' and utr is not null) or (method = 'cash' and utr is null)),
  foreign key (tenant_id, account_id) references public.tenants (id, account_id) on delete cascade
);
create unique index payment_requests_one_pending on public.payment_requests (tenant_id) where status = 'pending';
create unique index payment_requests_unique_utr on public.payment_requests (account_id, utr)
  where utr is not null and status in ('pending', 'approved');
create index payment_requests_account on public.payment_requests (account_id, status, created_at desc);

create table public.tenant_reminder_log (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  due date not null,
  stage text not null check (stage in ('before', 'today', 'late')),
  sent_at timestamptz not null default now(),
  primary key (tenant_id, due, stage)
);

alter table public.payment_links enable row level security;
alter table public.payment_requests enable row level security;
alter table public.tenant_reminder_log enable row level security;

revoke all on public.payment_links, public.payment_requests, public.tenant_reminder_log from anon, authenticated;
grant select on public.payment_requests to authenticated;
grant select, insert, delete on public.payment_links, public.tenant_reminder_log to service_role;
grant select on public.payment_requests to service_role;

create policy "members read payment requests" on public.payment_requests for select to authenticated
  using (account_id = (select private.my_account_id()));

-- What a tenant's private link may show: their own rent, and nothing else about the owner.
create function public.tenant_link_info(p_hash text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  l public.payment_links;
  t public.tenants;
  v_room text;
  v_property text;
  a public.accounts;
  r public.payment_requests;
begin
  select * into l from public.payment_links where token_hash = p_hash;
  if not found then return jsonb_build_object('state', 'invalid'); end if;
  select * into t from public.tenants where id = l.tenant_id;
  select * into a from public.accounts where id = l.account_id;
  select rm.label, p.name into v_room, v_property
    from public.rooms rm join public.properties p on p.id = rm.property_id where rm.id = t.room_id;
  select * into r from public.payment_requests
    where tenant_id = t.id and due = l.due order by created_at desc limit 1;

  return jsonb_build_object(
    'state', case when l.expires_at < now() or t.ended_on is not null or t.next_due <> l.due then 'closed' else 'open' end,
    'tenant_name', t.name,
    'room', v_room,
    'property', v_property,
    'due', l.due,
    'balance', t.rent - t.paid_so_far,
    'upi_id', a.upi_id,
    'upi_name', coalesce(a.upi_name, a.name),
    'emails_on', t.reminders_enabled,
    'opted_out', t.reminders_opted_out_at is not null,
    'request_status', r.status,
    'request_amount', r.amount,
    'request_method', r.method,
    'reject_reason', r.reject_reason
  );
end $$;

-- A tenant reports a payment. Nothing counts as paid until the owner approves it.
create function public.tenant_submit_payment(p_hash text, p_amount integer, p_method text, p_utr text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  l public.payment_links;
  t public.tenants;
  v_upi text;
  v_id uuid;
begin
  select * into l from public.payment_links where token_hash = p_hash;
  if not found or l.expires_at < now() then raise exception 'link_invalid'; end if;
  select * into t from public.tenants where id = l.tenant_id for update;
  if t.ended_on is not null or t.next_due <> l.due then raise exception 'link_closed'; end if;
  if exists (select 1 from public.payment_requests where tenant_id = t.id and status = 'pending') then
    raise exception 'request_pending';
  end if;
  if (select count(*) from public.payment_requests
      where tenant_id = t.id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'too_many_requests';
  end if;
  if p_amount is null or p_amount < 1 or p_amount > t.rent - t.paid_so_far then raise exception 'bad_amount'; end if;
  if p_method not in ('upi', 'cash') then raise exception 'bad_method'; end if;
  if p_method = 'upi' then
    select upi_id into v_upi from public.accounts where id = t.account_id;
    if v_upi is null then raise exception 'upi_unavailable'; end if;
    if p_utr is null or p_utr !~ '^[0-9]{12}$' then raise exception 'bad_utr'; end if;
  end if;

  begin
    insert into public.payment_requests (account_id, tenant_id, due, expected_paid, amount, method, utr)
    values (t.account_id, t.id, l.due, t.paid_so_far, p_amount, p_method, case when p_method = 'upi' then p_utr end)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'duplicate_utr';
  end;
  return v_id;
end $$;

-- Lets a tenant stop or restart their emails, even after the rent cycle has closed.
create function public.tenant_set_reminders(p_hash text, p_on boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_tenant uuid;
begin
  select tenant_id into v_tenant from public.payment_links where token_hash = p_hash;
  if not found then raise exception 'link_invalid'; end if;
  if p_on then
    update public.tenants set reminders_opted_out_at = null, reminders_enabled = email is not null
    where id = v_tenant and reminders_opted_out_at is not null;
  else
    update public.tenants set reminders_enabled = false, reminders_opted_out_at = now() where id = v_tenant;
  end if;
end $$;

create function public.approve_payment_request(p_request uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  r public.payment_requests;
  t public.tenants;
  p public.payments;
begin
  select * into r from public.payment_requests where id = p_request for update;
  if not found or not private.can_edit(r.account_id) then raise exception 'not_allowed'; end if;
  if r.status <> 'pending' then raise exception 'request_done'; end if;
  select * into t from public.tenants where id = r.tenant_id for update;
  if t.ended_on is not null or t.next_due <> r.due or t.paid_so_far <> r.expected_paid then
    raise exception 'request_stale';
  end if;
  select * into p from public.record_payment(
    r.tenant_id, r.amount, r.due, r.expected_paid, r.method,
    (r.created_at at time zone 'Asia/Kolkata')::date, 'tenant'
  );
  update public.payment_requests
  set status = 'approved', payment_id = p.id, decided_by = auth.uid(), decided_at = now()
  where id = r.id;
  return p.id;
end $$;

create function public.reject_payment_request(p_request uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r public.payment_requests;
begin
  select * into r from public.payment_requests where id = p_request for update;
  if not found or not private.can_edit(r.account_id) then raise exception 'not_allowed'; end if;
  if r.status <> 'pending' then raise exception 'request_done'; end if;
  update public.payment_requests
  set status = 'rejected', reject_reason = nullif(left(trim(coalesce(p_reason, '')), 200), ''),
      decided_by = auth.uid(), decided_at = now()
  where id = r.id;
end $$;

-- Undoing an approved payment frees its UTR and lets the tenant report again.
create function private.sync_undone_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.payment_requests set status = 'undone', decided_at = now()
  where payment_id = new.id and status = 'approved';
  return new;
end $$;
revoke all on function private.sync_undone_request() from public, anon, authenticated;
create trigger payments_undo_request after update of voided_at on public.payments
  for each row when (old.voided_at is null and new.voided_at is not null)
  execute function private.sync_undone_request();

revoke all on function public.tenant_link_info(text) from public, anon, authenticated;
revoke all on function public.tenant_submit_payment(text, integer, text, text) from public, anon, authenticated;
revoke all on function public.tenant_set_reminders(text, boolean) from public, anon, authenticated;
revoke all on function public.approve_payment_request(uuid) from public, anon;
revoke all on function public.reject_payment_request(uuid, text) from public, anon;
grant execute on function public.tenant_link_info(text) to service_role;
grant execute on function public.tenant_submit_payment(text, integer, text, text) to service_role;
grant execute on function public.tenant_set_reminders(text, boolean) to service_role;
grant execute on function public.approve_payment_request(uuid) to authenticated;
grant execute on function public.reject_payment_request(uuid, text) to authenticated;
