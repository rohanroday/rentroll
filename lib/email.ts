import nodemailer from "nodemailer";
import { balanceOf, compareStatus, daysUntil, rupees, statusText, type Status } from "./rent";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function sendEmail(to: string, subject: string, html: string, text: string) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) {
    // Online, a missing setting must fail loudly and never write tenant details to the logs.
    if (process.env.NODE_ENV === "production") throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is missing");
    console.log(`[email not sent: Gmail settings missing] subject="${subject}"\n${text}`);
    return;
  }
  await nodemailer
    .createTransport({ service: "gmail", auth: { user, pass } })
    .sendMail({ from: { name: "RentRoll", address: user }, to, subject, html, text });
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type ReminderRow = {
  id: string;
  name: string;
  room: string;
  property: string;
  rent: number;
  paid_so_far: number;
  next_due: string;
  status: Status;
};

const COLORS: Partial<Record<Status, { bg: string; fg: string; edge: string }>> = {
  overdue: { bg: "#B92B19", fg: "#FFFFFF", edge: "#B92B19" },
  today: { bg: "#FFFFFF", fg: "#10231E", edge: "#E2B13C" },
  soon: { bg: "#FFFFFF", fg: "#10231E", edge: "#123D33" },
  part: { bg: "#FFFFFF", fg: "#10231E", edge: "#123D33" },
};

export function reminderSubject(rows: ReminderRow[], today: string) {
  const first = rows[0];
  const lead =
    first.status === "overdue"
      ? `${first.name} is ${-daysUntil(first.next_due, today)} days late`
      : first.status === "today"
        ? `${first.name} is due today`
        : `${first.name}: ${statusText(first.status, first.next_due, today).toLowerCase()}`;
  return rows.length > 1 ? `Rent: ${lead}, +${rows.length - 1} more` : `Rent: ${lead}`;
}

export function reminderEmail(rawRows: ReminderRow[], accountName: string, today: string, canEdit: boolean) {
  const rows = [...rawRows].sort(compareStatus);
  const total = rows.reduce((sum, r) => sum + balanceOf(r), 0);
  const site = siteUrl();

  const cards = rows
    .map((r) => {
      const c = COLORS[r.status] ?? COLORS.soon!;
      const link = `${site}/pay/${r.id}?due=${r.next_due}&from=email`;
      const dashed = r.status === "part" ? "dashed" : "solid";
      const width = r.status === "today" ? 4 : 2;
      const action = canEdit
        ? `<a href="${link}" style="display:inline-block;margin-top:10px;padding:10px 16px;background:${r.status === "overdue" ? "#FFFFFF" : "#123D33"};color:${r.status === "overdue" ? "#B92B19" : "#FFFFFF"};font-weight:700;text-decoration:none;border-radius:6px">Mark paid</a>`
        : "";
      return `<tr><td style="padding:0 0 10px"><div style="background:${c.bg};color:${c.fg};border:${width}px ${dashed} ${c.edge};border-radius:6px;padding:12px 14px">
        <div style="font-size:14px;font-weight:700">Room ${escapeHtml(r.room)} &middot; ${escapeHtml(r.property)}</div>
        <div style="font-size:20px;font-weight:700;margin-top:2px">${escapeHtml(r.name)}</div>
        <div style="font-size:16px;margin-top:2px">${rupees(balanceOf(r))} &middot; <strong>${statusText(r.status, r.next_due, today)}</strong></div>
        ${action}</div></td></tr>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#EEF3EF;font-family:Arial,Helvetica,sans-serif;color:#10231E">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
  <tr><td style="background:#123D33;color:#F3F7F3;padding:18px;border-radius:6px 6px 0 0">
    <div style="font-weight:700">RentRoll &middot; ${escapeHtml(accountName)}</div>
    <div style="font-size:14px;margin-top:14px">Needs attention</div>
    <div style="font-size:32px;font-weight:700">${rupees(total)}</div>
  </td></tr><tr><td style="height:12px"></td></tr>${cards}
  <tr><td style="font-size:13px;padding-top:4px"><a href="${site}/rooms" style="color:#123D33;font-weight:700">Open all rooms</a></td></tr>
  </table></td></tr></table></body></html>`;

  const text = [
    `RentRoll: ${accountName}`,
    `Needs attention: ${rupees(total)}`,
    "",
    ...rows.map(
      (r) =>
        `Room ${r.room}, ${r.name}: ${rupees(balanceOf(r))}, ${statusText(r.status, r.next_due, today)}` +
        (canEdit ? `\nMark paid: ${site}/pay/${r.id}?due=${r.next_due}&from=email` : ""),
    ),
  ].join("\n");

  return { subject: reminderSubject(rows, today), html, text };
}

export function allClearEmail(accountName: string) {
  const site = siteUrl();
  return {
    subject: "Rent: all clear this week",
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#10231E;padding:16px"><p><strong>${escapeHtml(accountName)}</strong> has no rent due in the next 3 days.</p><p><a href="${site}/rooms" style="color:#123D33;font-weight:700">Open all rooms</a></p></body></html>`,
    text: `${accountName} has no rent due in the next 3 days.\n${site}/rooms`,
  };
}

export function inviteEmail(accountName: string, role: "full" | "view", link: string) {
  const access = role === "full" ? "Full access" : "View only";
  return {
    subject: `Join ${accountName} on RentRoll`,
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#10231E;padding:16px"><p>You've been invited to <strong>${escapeHtml(accountName)}</strong> on RentRoll with <strong>${access}</strong>.</p><p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#123D33;color:#fff;font-weight:700;text-decoration:none;border-radius:6px">Accept invite</a></p><p style="font-size:13px">This link works for 7 days and only with this email address.</p></body></html>`,
    text: `You've been invited to ${accountName} on RentRoll with ${access}.\nAccept: ${link}\nThis link works for 7 days and only with this email address.`,
  };
}
