-- Tenant reminders now go out once per day until rent is paid.
alter table public.tenant_reminder_log
  add column sent_on date not null default ((now() at time zone 'Asia/Kolkata')::date);

alter table public.tenant_reminder_log drop constraint tenant_reminder_log_pkey;
alter table public.tenant_reminder_log add primary key (tenant_id, due, sent_on);

-- Only the owner's team controls tenant emails, so the tenant opt-out is removed.
drop function public.tenant_set_reminders(text, boolean);
alter table public.tenants drop constraint tenants_reminders_respect_opt_out;

create or replace function public.tenant_link_info(p_hash text)
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
    'request_status', r.status,
    'request_amount', r.amount,
    'request_method', r.method,
    'reject_reason', r.reject_reason
  );
end $$;

alter table public.tenants drop column reminders_opted_out_at;
