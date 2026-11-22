import Link from "next/link";
import type { Plate } from "@/lib/data";
import { balanceOf, rupees, statusText } from "@/lib/rent";
import { Icon, type IconName } from "./icons";

type TenantPlate = Extract<Plate, { kind: "tenant" }>;
export type DueTab = "today" | "overdue" | "upcoming";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function Kpi({ tone, icon, value, label, note }: { tone: "green" | "amber" | "red" | "slate"; icon: IconName; value: number; label: string; note: string }) {
  return (
    <div className={`kpi kpi-${tone}`}>
      <span className="kpi-icon"><Icon name={icon} size={22} /></span>
      <div className="kpi-text">
        <strong>{rupees(value)}</strong>
        <span>{label}</span>
        <small>{note}</small>
      </div>
    </div>
  );
}

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export function DueList({
  active, counts, rows, today, canEdit, showProperty, query,
}: {
  active: DueTab;
  counts: Record<DueTab, number>;
  rows: TenantPlate[];
  today: string;
  canEdit: boolean;
  showProperty: boolean;
  query: string;
}) {
  const tabs: { id: DueTab; label: string }[] = [
    { id: "today", label: "Due Today" },
    { id: "overdue", label: "Overdue" },
    { id: "upcoming", label: "Upcoming" },
  ];
  const empty = { today: "No rent is due today.", overdue: "Nothing is overdue. Well done.", upcoming: "No upcoming rent yet." }[active];

  return (
    <section className="card" aria-labelledby="due-title">
      <h2 id="due-title">Rent Due List</h2>
      <div className="tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/rooms?${query}${query ? "&" : ""}tab=${tab.id}`}
            scroll={false}
            className={`tab tab-${tab.id}`}
            aria-current={active === tab.id ? "true" : undefined}
          >
            {tab.label} ({counts[tab.id]})
          </Link>
        ))}
      </div>
      {rows.length ? (
        <ul className="due-list">
          {rows.map((p) => (
            <li key={p.tenant.id}>
              <Link href={`/tenants/${p.tenant.id}`} className="due-person">
                <span className="avatar" aria-hidden="true">{initials(p.tenant.name)}</span>
                <span className="due-main">
                  <strong>{p.tenant.name}</strong>
                  <span>Room {p.label}{showProperty ? ` · ${p.property}` : ""}</span>
                </span>
                <span className="due-money">
                  <strong>{rupees(balanceOf(p.tenant))}</strong>
                  <span className={p.status === "overdue" ? "is-late" : undefined}>{statusText(p.status, p.next_due, today)}</span>
                </span>
              </Link>
              {canEdit && <Link className="btn btn-secondary btn-small" href={`/pay/${p.tenant.id}?due=${p.next_due}`}>Mark Paid</Link>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="due-empty"><Icon name="check" size={18} /> {empty}</p>
      )}
    </section>
  );
}

export function CollectionSummary({ collected, pending, overdue }: { collected: number; pending: number; overdue: number }) {
  const total = collected + pending + overdue;
  const percent = total ? Math.round((collected / total) * 100) : 0;
  const parts = [
    { label: "Collected", value: collected, tone: "green" },
    { label: "Pending", value: pending, tone: "amber" },
    { label: "Overdue", value: overdue, tone: "red" },
  ];
  let offset = 0;
  return (
    <section className="card" aria-labelledby="summary-title">
      <h2 id="summary-title">Collection Summary</h2>
      <div className="summary">
        <div className="donut" role="img" aria-label={`${percent}% of this month's rent collected`}>
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" className="donut-track" />
            {total > 0 && parts.filter((p) => p.value > 0).map((p) => {
              const size = (p.value / total) * 100;
              const segment = (
                <circle key={p.label} cx="60" cy="60" r="48" pathLength={100} className={`donut-${p.tone}`}
                  strokeDasharray={`${size} ${100 - size}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
              );
              offset += size;
              return segment;
            })}
          </svg>
          <div className="donut-label"><strong>{percent}%</strong><span>Collected</span></div>
        </div>
        <dl className="legend">
          {parts.map((p) => (
            <div key={p.label}>
              <dt><i className={`dot dot-${p.tone}`} />{p.label}</dt>
              <dd>{rupees(p.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export const kpiNotes = {
  payments: (n: number) => plural(n, "payment"),
  tenants: (n: number) => plural(n, "tenant"),
};
