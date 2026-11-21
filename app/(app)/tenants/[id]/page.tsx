import Link from "next/link";
import { notFound } from "next/navigation";
import { moveOut } from "@/app/actions";
import { Icon } from "@/components/icons";
import { PaymentRow } from "@/components/payment-row";
import { ActionForm, Submit } from "@/components/ui";
import { getContext, type Payment, type Tenant } from "@/lib/data";
import { balanceOf, daysUntil, formatDate, rupees, statusOf, statusText, todayIST } from "@/lib/rent";

export const metadata = { title: "Tenant · RentRoll" };

export default async function TenantPage({ params }: PageProps<"/tenants/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, canEdit } = await getContext();
  const [{ data: row }, { data: history }] = await Promise.all([
    supabase.from("tenants").select("*, rooms(label, properties(name))").eq("id", id).maybeSingle(),
    supabase.from("payments").select("*").eq("tenant_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (!row) notFound();

  const tenant = row as Tenant & { rooms: { label: string; properties: { name: string } } };
  const payments = (history ?? []) as Payment[];
  const today = todayIST();
  const paidMonth = new Set(payments.some((p) => !p.voided_at && p.balance_left === 0 && p.paid_on.slice(0, 7) === today.slice(0, 7)) ? [tenant.id] : []);
  const status = statusOf(tenant, today, paidMonth);
  const latest = payments.find((p) => !p.voided_at);
  const active = !tenant.ended_on;

  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}>
        <Link href="/rooms" className="back" aria-label="Back to rooms"><Icon name="back" size={24} /></Link>
        <span className="muted">{tenant.rooms.properties.name}</span>
      </div>

      <section className={`tenant-card${status === "overdue" && active ? " is-overdue" : ""}`}>
        <span className="plate-no">Room {tenant.rooms.label}</span>
        <h1>{tenant.name}</h1>
        {active ? (
          <>
            <p className="tenant-amount">{rupees(balanceOf(tenant))}</p>
            <p className="tenant-state">
              {status === "paid"
                ? `Paid · next rent due ${formatDate(tenant.next_due)}`
                : `${statusText(status, tenant.next_due, today)}${status !== "part" && daysUntil(tenant.next_due, today) !== 0 ? ` · ${formatDate(tenant.next_due)}` : ""}`}
            </p>
          </>
        ) : (
          <p className="tenant-state">Moved out on {formatDate(tenant.ended_on!)}</p>
        )}
      </section>

      {active && (
        <div className="actions">
          {canEdit && <Link className="btn btn-primary" href={`/pay/${tenant.id}?due=${tenant.next_due}`}>Record payment</Link>}
          {tenant.phone && <a className="btn btn-secondary" href={`tel:+91${tenant.phone}`}><Icon name="phone" size={18} /> Call {tenant.name}</a>}
        </div>
      )}

      <section className="panel">
        <dl className="facts">
          <dt>Monthly rent</dt><dd>{rupees(tenant.rent)}</dd>
          <dt>Due every month on</dt><dd>Day {tenant.due_day}</dd>
          <dt>Paid this cycle</dt><dd>{rupees(tenant.paid_so_far)}</dd>
          {tenant.phone && (<><dt>Mobile</dt><dd>{tenant.phone}</dd></>)}
          {tenant.email && (<><dt>Email</dt><dd>{tenant.email}</dd></>)}
        </dl>
        {canEdit && active && <Link className="btn btn-secondary btn-block" style={{ marginTop: 14 }} href={`/tenants/${tenant.id}/edit`}>Edit details</Link>}
      </section>

      <section className="stack-sm">
        <h2>Payment history</h2>
        {payments.length ? (
          <ul className="list">
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} showTenant={false} canUndo={canEdit && p.id === latest?.id && active} />
            ))}
          </ul>
        ) : (
          <p className="notice notice-info">No payments recorded yet.</p>
        )}
      </section>

      {canEdit && active && (
        <section className="panel stack-sm">
          <h2>Tenant moved out?</h2>
          <p className="muted">The room becomes vacant. Their payment history stays saved.</p>
          <ActionForm action={moveOut.bind(null, tenant.id)}>
            <label className="check-row"><input type="checkbox" name="confirm" value="yes" /> <span>{tenant.name} has moved out</span></label>
            <Submit variant="danger" pending="Updating…">Mark as moved out</Submit>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
