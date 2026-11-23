import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  allClearEmail, reminderEmail, sendEmail, siteUrl, tenantReminderEmail,
  type ReminderRow,
} from "@/lib/email";
import { daysUntil, statusOf, tenantReminderStage, todayIST } from "@/lib/rent";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Protects the sending Gmail account's daily limit.
const MAX_TENANT_EMAILS = 150;

const authorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
};

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const today = todayIST();
  const isSunday = new Date(`${today}T00:00:00Z`).getUTCDay() === 0;

  const [accounts, members, tenants, logs, tenantLogs, pending] = await Promise.all([
    admin.from("accounts").select("id, name"),
    admin.from("members").select("account_id, user_id, email, role"),
    admin
      .from("tenants")
      .select("id, account_id, name, email, reminders_enabled, rent, paid_so_far, next_due, rooms(label, properties(name))")
      .is("ended_on", null),
    admin.from("reminder_log").select("account_id, user_id").eq("sent_on", today),
    admin.from("tenant_reminder_log").select("tenant_id, due, stage"),
    admin.from("payment_requests").select("tenant_id").eq("status", "pending"),
  ]);
  const failure = accounts.error ?? members.error ?? tenants.error ?? logs.error ?? tenantLogs.error ?? pending.error;
  if (failure || !accounts.data || !members.data || !tenants.data || !logs.data || !tenantLogs.data || !pending.data) {
    return NextResponse.json({ error: failure?.message ?? "No data returned" }, { status: 500 });
  }

  const alreadySent = new Set(logs.data.map((l) => `${l.account_id}:${l.user_id}`));
  let sent = 0;
  let failed = 0;

  for (const account of accounts.data) {
    const rows: ReminderRow[] = tenants.data
      .filter((t) => t.account_id === account.id && daysUntil(t.next_due, today) <= 3)
      .map((t) => {
        const room = t.rooms as unknown as { label: string; properties: { name: string } };
        return {
          id: t.id,
          name: t.name,
          room: room.label,
          property: room.properties.name,
          rent: t.rent,
          paid_so_far: t.paid_so_far,
          next_due: t.next_due,
          status: statusOf(t, today, new Set()),
        };
      });
    if (!rows.length && !isSunday) continue;

    for (const member of members.data.filter((m) => m.account_id === account.id)) {
      if (alreadySent.has(`${account.id}:${member.user_id}`)) continue;
      const message = rows.length
        ? reminderEmail(rows, account.name, today, member.role === "full")
        : allClearEmail(account.name, today);

      // Logged first so a retry can never send the same morning's email twice.
      const { error } = await admin
        .from("reminder_log")
        .insert({ account_id: account.id, user_id: member.user_id, sent_on: today });
      if (error) continue;
      try {
        await sendEmail(member.email, message.subject, message.html, message.text);
        sent += 1;
      } catch (e) {
        failed += 1;
        console.error(`Reminder failed for account ${account.id}:`, e);
        await admin
          .from("reminder_log")
          .delete()
          .match({ account_id: account.id, user_id: member.user_id, sent_on: today });
      }
    }
  }

  // Tenant emails: only for tenants the owner turned on, at most once per stage of each rent cycle.
  const sentStages = new Set(tenantLogs.data.map((l) => `${l.tenant_id}:${l.due}:${l.stage}`));
  const waiting = new Set(pending.data.map((p) => p.tenant_id));
  let tenantSent = 0;

  for (const t of tenants.data) {
    if (tenantSent >= MAX_TENANT_EMAILS) break;
    if (!t.reminders_enabled || !t.email || waiting.has(t.id)) continue;
    const stage = tenantReminderStage(daysUntil(t.next_due, today));
    if (!stage) continue;
    if (sentStages.has(`${t.id}:${t.next_due}:${stage}`)) continue;

    const { error: logError } = await admin.from("tenant_reminder_log").insert({ tenant_id: t.id, due: t.next_due, stage });
    if (logError) continue;
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const undoLog = () => admin.from("tenant_reminder_log").delete().match({ tenant_id: t.id, due: t.next_due, stage });
    const { error: linkError } = await admin
      .from("payment_links")
      .insert({ account_id: t.account_id, tenant_id: t.id, token_hash: tokenHash, due: t.next_due });
    if (linkError) {
      failed += 1;
      await undoLog();
      continue;
    }
    const room = t.rooms as unknown as { label: string; properties: { name: string } };
    const message = tenantReminderEmail({
      tenantName: t.name,
      room: room.label,
      property: room.properties.name,
      amount: t.rent - t.paid_so_far,
      due: t.next_due,
      stage,
      link: `${siteUrl()}/t/${token}`,
    });
    try {
      await sendEmail(t.email, message.subject, message.html, message.text);
      tenantSent += 1;
    } catch (e) {
      failed += 1;
      console.error(`Tenant reminder failed for tenant ${t.id}:`, e);
      await admin.from("payment_links").delete().eq("token_hash", tokenHash);
      await undoLog();
    }
  }

  return NextResponse.json({ sent, tenantSent, failed }, { status: failed ? 500 : 200 });
}
