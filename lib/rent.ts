export type Status = "overdue" | "today" | "soon" | "part" | "upcoming" | "paid";

export type TenantLike = {
  id: string;
  rent: number;
  next_due: string;
  paid_so_far: number;
};

const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86_400_000;

export const todayIST = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);

export const daysUntil = (date: string, today: string) => Math.round((utc(date) - utc(today)) / DAY_MS);

export const monthStart = (today: string) => `${today.slice(0, 7)}-01`;

export function monthEnd(today: string) {
  const [year, month] = today.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

// Owners and tenants both start getting reminders this many days before rent is due.
export const REMINDER_DAYS = 5;

// Which tenant email applies, given the days until rent is due (negative means late).
export function tenantReminderStage(days: number): "before" | "today" | "late" | null {
  if (days > REMINDER_DAYS) return null;
  if (days < 0) return "late";
  return days === 0 ? "today" : "before";
}

export const balanceOf =(t: Pick<TenantLike, "rent" | "paid_so_far">) => t.rent - t.paid_so_far;

export function statusOf(t: TenantLike, today: string, paidThisMonth: ReadonlySet<string>): Status {
  const days = daysUntil(t.next_due, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (t.paid_so_far > 0) return "part";
  if (days <= REMINDER_DAYS) return "soon";
  return paidThisMonth.has(t.id) && t.next_due > monthEnd(today) ? "paid" : "upcoming";
}

// Everything not yet due sorts by its real due date, so a part payment can't hide a nearer rent.
const ORDER: Record<Status, number> = { overdue: 0, today: 1, soon: 2, part: 2, upcoming: 2, paid: 3 };

export const compareStatus = (a: { status: Status; next_due: string }, b: { status: Status; next_due: string }) =>
  ORDER[a.status] - ORDER[b.status] || a.next_due.localeCompare(b.next_due);

export function statusText(status: Status, nextDue: string, today: string) {
  const days = daysUntil(nextDue, today);
  switch (status) {
    case "overdue":
      return `${-days} ${days === -1 ? "day" : "days"} late`;
    case "today":
      return "Due today";
    case "soon":
      return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
    case "part":
      return `Part paid · due ${formatDate(nextDue, true)}`;
    case "paid":
      return "Paid";
    default:
      return `Due ${formatDate(nextDue, true)}`;
  }
}

export const rupees = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const monthName = (today: string) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" }).format(new Date(`${today}T00:00:00Z`));
