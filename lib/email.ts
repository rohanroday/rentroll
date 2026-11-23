import nodemailer from "nodemailer";
import { balanceOf, compareStatus, formatDate, REMINDER_DAYS, rupees, statusText, type Status } from "./rent";

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
  await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
    from: { name: "RentRoll", address: user },
    replyTo: user,
    to,
    subject,
    html,
    text,
    headers: { "Auto-Submitted": "auto-generated" },
  });
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

const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

// A plain, readable layout: heavy colour blocks and big buttons are common in scam mail.
const page = (accountName: string, intro: string, body: string, footer?: string) => {
  const name = escapeHtml(accountName);
  const note = footer ?? `You're receiving this because your email is on the RentRoll team for ${name}. Questions? Reply to this email.`;
  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#ffffff;color:#10231E;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:20px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td><p style="margin:0 0 4px;font-size:18px;font-weight:700">${name}</p><p style="margin:0 0 16px">${intro}</p></td></tr>
${body}
<tr><td style="padding-top:20px;border-top:1px solid #C3D3CA;font-size:13px;color:#3F5850">${note}</td></tr>
</table></td></tr></table></body></html>`;
};

export function reminderSubject(rows: ReminderRow[], today: string) {
  const first = rows[0];
  const lead = `${first.name}, Room ${first.room}: rent ${lowerFirst(statusText(first.status, first.next_due, today))}`;
  return rows.length > 1 ? `${lead} and ${rows.length - 1} more` : lead;
}

export function reminderEmail(rawRows: ReminderRow[], accountName: string, today: string, canEdit: boolean) {
  const rows = [...rawRows].sort(compareStatus);
  const total = rows.reduce((sum, r) => sum + balanceOf(r), 0);
  const site = siteUrl();
  const count = rows.length === 1 ? "1 room needs" : `${rows.length} rooms need`;
  const intro = `Today's rent update: ${count} attention, ${rupees(total)} in total.`;

  const list = rows
    .map((r) => {
      const late = r.status === "overdue";
      const link = `${site}/pay/${r.id}?due=${r.next_due}&from=email`;
      const action = canEdit
        ? `<br><a href="${link}" style="color:#005536;font-weight:700">Mark paid</a>`
        : "";
      return `<tr><td style="padding:12px 0;border-top:1px solid #C3D3CA">
<strong>${escapeHtml(r.name)}</strong> &middot; Room ${escapeHtml(r.room)}, ${escapeHtml(r.property)}<br>
${rupees(balanceOf(r))} &middot; <strong style="color:${late ? "#B92B19" : "#10231E"}">${escapeHtml(statusText(r.status, r.next_due, today))}</strong>${action}
</td></tr>`;
    })
    .join("");

  const open = `<tr><td style="padding:4px 0 20px"><a href="${site}/rooms" style="color:#005536;font-weight:700">Open all rooms</a></td></tr>`;
  const text = [
    accountName,
    intro,
    "",
    ...rows.map(
      (r) =>
        `${r.name}, Room ${r.room}, ${r.property}: ${rupees(balanceOf(r))}, ${statusText(r.status, r.next_due, today)}` +
        (canEdit ? `\nMark paid: ${site}/pay/${r.id}?due=${r.next_due}&from=email` : ""),
    ),
    "",
    `Open all rooms: ${site}/rooms`,
    "",
    `You're receiving this because your email is on the RentRoll team for ${accountName}. Questions? Reply to this email.`,
  ].join("\n");

  return { subject: reminderSubject(rows, today), html: page(accountName, intro, list + open), text };
}

export function allClearEmail(accountName: string, today: string) {
  const site = siteUrl();
  const intro = `No rent is due in the next ${REMINDER_DAYS} days, as of ${formatDate(today)}.`;
  return {
    subject: `${accountName}: no rent due this week`,
    html: page(accountName, intro, `<tr><td style="padding:0 0 20px"><a href="${site}/rooms" style="color:#005536;font-weight:700">Open all rooms</a></td></tr>`),
    text: `${accountName}\n${intro}\n\nOpen all rooms: ${site}/rooms\n\nYou're receiving this because your email is on the RentRoll team for ${accountName}. Questions? Reply to this email.`,
  };
}

export function inviteEmail(accountName: string, role: "full" | "view", link: string) {
  const access = role === "full" ? "Full access" : "View only";
  const intro = `You've been invited to help manage rent for ${escapeHtml(accountName)} with ${access}.`;
  return {
    subject: `Invitation to ${accountName} on RentRoll`,
    html: page(accountName, intro, `<tr><td style="padding:0 0 20px"><a href="${link}" style="color:#005536;font-weight:700">Accept invite</a><br><span style="font-size:14px;color:#3F5850">This link works for 7 days and only with this email address.</span></td></tr>`),
    text: `You've been invited to help manage rent for ${accountName} with ${access}.\nAccept invite: ${link}\nThis link works for 7 days and only with this email address.`,
  };
}

const linkRow = (href: string, label: string) =>
  `<tr><td style="padding:0 0 20px"><a href="${href}" style="color:#005536;font-weight:700">${label}</a></td></tr>`;

export type TenantStage = "before" | "today" | "late";

export function tenantReminderEmail(input: {
  tenantName: string;
  room: string;
  property: string;
  amount: number;
  due: string;
  stage: TenantStage;
  link: string;
}) {
  const { tenantName, room, property, amount, due, stage, link } = input;
  const when = stage === "today" ? "is due today" : stage === "late" ? `was due on ${formatDate(due)}` : `is due on ${formatDate(due)}`;
  const line = `Hi ${tenantName}, your rent of ${rupees(amount)} for Room ${room} ${when}.`;
  const footer = "You're receiving this because your landlord uses RentRoll for rent reminders. To stop these emails, please contact your landlord.";
  return {
    subject: `Rent reminder: Room ${room}, ${rupees(amount)} ${stage === "today" ? "due today" : stage === "late" ? "overdue" : `due ${formatDate(due, true)}`}`,
    html: page(property, escapeHtml(line), linkRow(link, "Pay rent or tell your landlord you've paid"), footer),
    text: `${property}\n${line}\n\nPay rent or tell your landlord you've paid:\n${link}\n\n${footer}`,
  };
}

export function ownerRequestEmail(input: {
  accountName: string;
  tenantName: string;
  room: string;
  amount: number;
  method: "upi" | "cash";
  utr: string | null;
}) {
  const { accountName, tenantName, room, amount, method, utr } = input;
  const how = method === "upi" ? `UPI, transaction number ${utr}` : "cash";
  const line = `${tenantName}, Room ${room}, reported paying ${rupees(amount)} by ${how}.`;
  const check = method === "upi" ? "Check your bank or UPI app before approving." : "Approve only after you've received the cash.";
  const link = `${siteUrl()}/rooms#approvals`;
  return {
    subject: `Approve payment: ${tenantName}, Room ${room}, ${rupees(amount)}`,
    html: page(accountName, escapeHtml(line), `<tr><td style="padding:0 0 12px">${check}</td></tr>${linkRow(link, "Review payment")}`),
    text: `${accountName}\n${line}\n${check}\n\nReview payment: ${link}`,
  };
}

export function tenantResultEmail(input: {
  property: string;
  tenantName: string;
  room: string;
  amount: number;
  approved: boolean;
  reason?: string | null;
}) {
  const { property, tenantName, room, amount, approved, reason } = input;
  const line = approved
    ? `Hi ${tenantName}, your landlord confirmed your payment of ${rupees(amount)} for Room ${room}.`
    : `Hi ${tenantName}, your landlord could not confirm your payment of ${rupees(amount)} for Room ${room}. Please contact them.`;
  const why = !approved && reason ? `Reason: ${reason}` : "";
  const footer = "This message is about a payment you reported through RentRoll.";
  return {
    subject: approved ? `Payment confirmed: Room ${room}, ${rupees(amount)}` : `Payment not confirmed: Room ${room}`,
    html: page(property, escapeHtml(line), why ? `<tr><td style="padding:0 0 20px">${escapeHtml(why)}</td></tr>` : "", footer),
    text: [property, line, why, "", footer].filter((part, i) => part || i === 3).join("\n"),
  };
}
