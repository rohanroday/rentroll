import Link from "next/link";
import { CollectionSummary, DueList, Kpi, kpiNotes, type DueTab } from "@/components/dashboard";
import { Icon } from "@/components/icons";
import { RoomPlate } from "@/components/plate";
import { RecordedToast } from "@/components/recorded-toast";
import { getBoard, getContext, getProperties } from "@/lib/data";
import { monthName } from "@/lib/rent";

export const metadata = { title: "Dashboard · RentRoll" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function Rooms({ searchParams }: PageProps<"/rooms">) {
  const { property, recorded, tab } = await searchParams;
  const { canEdit, supabase, accountId } = await getContext();
  const properties = await getProperties();
  const selected = properties.find((p) => p.id === property);
  const { today, plates, toCollect, collected, summary } = await getBoard(selected?.id);
  const scope = selected?.name ?? (properties.length > 1 ? "all properties" : properties[0]?.name);
  const showProperty = !selected && properties.length > 1;
  // Only a real, still-valid payment gets a confirmation, so Back after Undo can't show a false one.
  const { data: payment } =
    typeof recorded === "string" && /^[0-9a-f-]{36}$/i.test(recorded)
      ? await supabase.from("payments").select("tenant_id").eq("id", recorded).eq("account_id", accountId).is("voided_at", null).maybeSingle()
      : { data: null };
  const paidPlate = payment ? plates.find((p) => p.kind === "tenant" && p.tenant.id === payment.tenant_id) : undefined;
  const addHref = selected ? `/rooms/new?property=${encodeURIComponent(selected.name)}` : "/rooms/new";

  const fallback: DueTab = summary.overdue.count ? "overdue" : summary.today.count ? "today" : "upcoming";
  const activeTab: DueTab = tab === "today" || tab === "overdue" || tab === "upcoming" ? tab : fallback;
  const counts = { today: summary.today.count, overdue: summary.overdue.count, upcoming: summary.upcoming.count };

  return (
    <div className={`content${paidPlate ? " has-toast" : ""}`}>
      {paidPlate?.kind === "tenant" && <RecordedToast paymentId={String(recorded)} name={paidPlate.tenant.name} tenantId={paidPlate.tenant.id} />}

      <header className="dash-head">
        <div>
          <h1>{greeting()}</h1>
          <p className="muted">Your {monthName(today)} rent summary for {scope}</p>
        </div>
        {canEdit && (
          <Link className="btn btn-primary btn-small" href={addHref}>
            <Icon name="plus" size={18} /> Add tenant
          </Link>
        )}
      </header>

      {properties.length > 1 && (
        <div className="property-tabs">
          <Link href="/rooms" aria-current={!selected}>All</Link>
          {properties.map((p) => (
            <Link key={p.id} href={`/rooms?property=${p.id}`} aria-current={selected?.id === p.id}>{p.name}</Link>
          ))}
        </div>
      )}

      {plates.length ? (
        <>
          <div className="kpis">
            <Kpi tone="green" icon="wallet" value={collected} label="Collected" note={kpiNotes.payments(summary.paymentCount)} />
            <Kpi tone="amber" icon="calendar" value={summary.today.amount} label="Due Today" note={kpiNotes.tenants(summary.today.count)} />
            <Kpi tone="red" icon="alert" value={summary.overdue.amount} label="Overdue" note={kpiNotes.tenants(summary.overdue.count)} />
            <Kpi tone="slate" icon="layers" value={collected + toCollect} label="Total Expected" note={kpiNotes.tenants(summary.expectedTenantCount)} />
          </div>

          <div className="dash-grid">
            <DueList
              active={activeTab}
              counts={counts}
              rows={summary[activeTab].rows}
              today={today}
              canEdit={canEdit}
              showProperty={showProperty}
              query={selected ? `property=${selected.id}` : ""}
            />
            <CollectionSummary collected={collected} pending={Math.max(toCollect - summary.overdue.amount, 0)} overdue={summary.overdue.amount} />
          </div>

          <section aria-labelledby="rooms-title">
            <div className="section-head"><h2 id="rooms-title">All rooms</h2></div>
            <div className="plates">
              {plates.map((plate) => (
                <RoomPlate
                  key={plate.roomId}
                  plate={plate}
                  today={today}
                  canEdit={canEdit}
                  showProperty={showProperty}
                  justPaid={plate === paidPlate}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="empty">
          <span className="empty-icon"><Icon name="rooms" size={28} /></span>
          <h2>Add your first room</h2>
          <p className="muted">{canEdit ? "Add a tenant and their rent will appear here." : "Rooms will appear here once the owner adds them."}</p>
          {canEdit && <Link className="btn btn-primary" href={addHref}>Add first tenant</Link>}
        </div>
      )}
    </div>
  );
}
