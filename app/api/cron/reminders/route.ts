import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { allClearEmail, reminderEmail, sendEmail, type ReminderRow } from "@/lib/email";
import { daysUntil, statusOf, todayIST } from "@/lib/rent";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const [accounts, members, tenants, logs] = await Promise.all([
    admin.from("accounts").select("id, name"),
    admin.from("members").select("account_id, user_id, email, role"),
    admin
      .from("tenants")
      .select("id, account_id, name, rent, paid_so_far, next_due, rooms(label, properties(name))")
      .is("ended_on", null),
    admin.from("reminder_log").select("account_id, user_id").eq("sent_on", today),
  ]);
  const failure = accounts.error ?? members.error ?? tenants.error ?? logs.error;
  if (failure || !accounts.data || !members.data || !tenants.data || !logs.data) {
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
  return NextResponse.json({ sent, failed }, { status: failed ? 500 : 200 });
}
