-- A room that has ever had a tenant can't be deleted, so payment history can't be erased.
drop policy "full access deletes empty rooms" on public.rooms;
create policy "full access deletes empty rooms" on public.rooms for delete to authenticated
  using (
    private.can_edit(account_id)
    and not exists (select 1 from public.tenants t where t.room_id = rooms.id)
  );

-- Limits invite emails so nobody can use the app's Gmail account to send spam.
create table private.invite_sends (
  account_id uuid not null references public.accounts (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table private.invite_sends enable row level security;
create index invite_sends_recent on private.invite_sends (sent_at, account_id);

create function private.limit_invites() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('rentroll_invite_limit'));
  delete from private.invite_sends where sent_at < now() - interval '2 days';
  if (select count(*) from private.invite_sends
      where account_id = new.account_id and sent_at > now() - interval '1 day') >= 10
     or (select count(*) from private.invite_sends where sent_at > now() - interval '1 day') >= 100 then
    raise exception 'invite_limit';
  end if;
  insert into private.invite_sends (account_id) values (new.account_id);
  return new;
end $$;

revoke all on function private.limit_invites() from public, anon, authenticated;
revoke all on private.invite_sends from public, anon, authenticated;

create trigger invites_limit before insert on public.invites
  for each row execute function private.limit_invites();
