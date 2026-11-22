import { redirect } from "next/navigation";
import { cache } from "react";
import { balanceOf, compareStatus, monthEnd, monthStart, statusOf, todayIST, type Status } from "./rent";
import { createClient } from "./supabase/server";

export type Role = "full" | "view";

export type Tenant = {
  id: string;
  room_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  rent: number;
  due_day: number;
  next_due: string;
  paid_so_far: number;
  ended_on: string | null;
};

export type Payment = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_label: string;
  amount: number;
  balance_left: number;
  method: string;
  paid_on: string;
  was_due: string;
  next_due: string;
  source: string;
  recorded_by_email: string | null;
  voided_at: string | null;
  created_at: string;
};

export type Plate =
  | { kind: "tenant"; roomId: string; label: string; property: string; tenant: Tenant; status: Status; next_due: string }
  | { kind: "vacant"; roomId: string; label: string; property: string };

export const getContext = cache(async () => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("account_id, role, accounts(name, owner_id)")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!member) redirect("/setup");

  const account = member.accounts as unknown as { name: string; owner_id: string };
  return {
    supabase,
    user: auth.user,
    accountId: member.account_id as string,
    accountName: account.name,
    role: member.role as Role,
    canEdit: member.role === "full",
    isOwner: account.owner_id === auth.user.id,
  };
});

export async function getProperties() {
  const { supabase, accountId } = await getContext();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("account_id", accountId)
    .order("created_at");
  if (error) throw error;
  return data as { id: string; name: string; address: string | null }[];
}

export async function getBoard(propertyId?: string) {
  const { supabase, accountId } = await getContext();
  const today = todayIST();

  let roomQuery = supabase
    .from("rooms")
    .select("id, label, property_id, properties(name)")
    .eq("account_id", accountId);
  if (propertyId) roomQuery = roomQuery.eq("property_id", propertyId);

  const [rooms, tenants, payments] = await Promise.all([
    roomQuery,
    supabase.from("tenants").select("*").eq("account_id", accountId).is("ended_on", null),
    supabase
      .from("payments")
      .select("tenant_id, amount, balance_left")
      .eq("account_id", accountId)
      .is("voided_at", null)
      .gte("paid_on", monthStart(today))
      .lte("paid_on", monthEnd(today)),
  ]);
  if (rooms.error) throw rooms.error;
  if (tenants.error) throw tenants.error;
  if (payments.error) throw payments.error;

  const roomIds = new Set(rooms.data.map((r) => r.id));
  const active = (tenants.data as Tenant[]).filter((t) => roomIds.has(t.room_id));
  const activeIds = new Set(active.map((t) => t.id));
  const monthPayments = payments.data.filter((p) => !propertyId || activeIds.has(p.tenant_id));
  const paidThisMonth = new Set(monthPayments.filter((p) => p.balance_left === 0).map((p) => p.tenant_id));
  const byRoom = new Map(active.map((t) => [t.room_id, t]));

  const occupied: Extract<Plate, { kind: "tenant" }>[] = [];
  const vacant: Extract<Plate, { kind: "vacant" }>[] = [];
  for (const room of rooms.data) {
    const property = (room.properties as unknown as { name: string }).name;
    const tenant = byRoom.get(room.id);
    if (tenant) {
      occupied.push({
        kind: "tenant",
        roomId: room.id,
        label: room.label,
        property,
        tenant,
        status: statusOf(tenant, today, paidThisMonth),
        next_due: tenant.next_due,
      });
    } else {
      vacant.push({ kind: "vacant", roomId: room.id, label: room.label, property });
    }
  }
  occupied.sort(compareStatus);
  vacant.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  const end = monthEnd(today);
  const toCollect = active.filter((t) => t.next_due <= end).reduce((sum, t) => sum + balanceOf(t), 0);
  const collected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const group = (...statuses: Status[]) => {
    const rows = occupied.filter((p) => statuses.includes(p.status));
    return { rows, count: rows.length, amount: rows.reduce((sum, p) => sum + balanceOf(p.tenant), 0) };
  };
  const summary = {
    overdue: group("overdue"),
    today: group("today"),
    upcoming: group("soon", "part", "upcoming"),
    paymentCount: monthPayments.length,
    // Matches Total Expected: rent due by month end, plus anyone already paid this month.
    expectedTenantCount: occupied.filter((p) => p.next_due <= end || monthPayments.some((m) => m.tenant_id === p.tenant.id)).length,
  };
  return { today, plates: [...occupied, ...vacant] as Plate[], toCollect, collected, summary };
}
