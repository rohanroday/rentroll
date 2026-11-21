import Link from "next/link";
import { Icon } from "@/components/icons";
import { RoomPlate } from "@/components/plate";
import { RecordedToast } from "@/components/recorded-toast";
import { getBoard, getContext, getProperties } from "@/lib/data";
import { monthName, rupees } from "@/lib/rent";

export const metadata = { title: "Rooms · RentRoll" };

export default async function Rooms({ searchParams }: PageProps<"/rooms">) {
  const { property, recorded } = await searchParams;
  const { canEdit, supabase, accountId } = await getContext();
  const properties = await getProperties();
  const selected = properties.find((p) => p.id === property);
  const { today, plates, toCollect, collected } = await getBoard(selected?.id);
  const scope = selected?.name ?? (properties.length > 1 ? "All properties" : properties[0]?.name);
  const showProperty = !selected && properties.length > 1;
  // Only a real, still-valid payment gets a confirmation, so Back after Undo can't show a false one.
  const { data: payment } =
    typeof recorded === "string" && /^[0-9a-f-]{36}$/i.test(recorded)
      ? await supabase.from("payments").select("tenant_id").eq("id", recorded).eq("account_id", accountId).is("voided_at", null).maybeSingle()
      : { data: null };
  const paidPlate = payment ? plates.find((p) => p.kind === "tenant" && p.tenant.id === payment.tenant_id) : undefined;
  const expected = toCollect + collected;
  const percent = expected ? Math.round((collected / expected) * 100) : 0;
  const addHref = selected ? `/rooms/new?property=${encodeURIComponent(selected.name)}` : "/rooms/new";

  return (
    <>
      <header className="board-head">
        <div className="board-head-in">
          <div className="board-top">
            <strong className="brand-mobile">RentRoll</strong>
            <span className="board-month">{monthName(today)}</span>
          </div>
          <p className="board-label">Still to collect · {scope}</p>
          <p className="board-total">{rupees(toCollect)}</p>
          <p className="board-sub">{rupees(collected)} of {rupees(expected)} collected</p>
          <div className="progress" role="progressbar" aria-label="Rent collected this month" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <div className={`content${paidPlate ? " has-toast" : ""}`}>
        {paidPlate?.kind === "tenant" && <RecordedToast paymentId={String(recorded)} name={paidPlate.tenant.name} tenantId={paidPlate.tenant.id} />}
        {properties.length > 1 && (
          <div className="property-tabs">
            <Link href="/rooms" aria-current={!selected}>All</Link>
            {properties.map((p) => (
              <Link key={p.id} href={`/rooms?property=${p.id}`} aria-current={selected?.id === p.id}>{p.name}</Link>
            ))}
          </div>
        )}
        <div className="section-head">
          <h2>Rooms</h2>
          {canEdit && (
            <Link className="btn btn-secondary btn-small" href={addHref}>
              <Icon name="plus" size={18} /> Add tenant
            </Link>
          )}
        </div>

        {plates.length ? (
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
        ) : (
          <div className="empty">
            <h2>Your board is empty</h2>
            <p className="muted">{canEdit ? "Add your first tenant and their room will appear here." : "Rooms will appear here once the owner adds them."}</p>
            {canEdit && <Link className="btn btn-primary" href={addHref}>Add first tenant</Link>}
          </div>
        )}
      </div>
    </>
  );
}
