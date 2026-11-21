import Link from "next/link";
import { PaymentRow } from "@/components/payment-row";
import { getContext, type Payment } from "@/lib/data";
import { formatDate, rupees } from "@/lib/rent";

export const metadata = { title: "Payments · RentRoll" };

export default async function Payments() {
  const { supabase, accountId, canEdit } = await getContext();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("account_id", accountId)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const payments = data as Payment[];

  const latestByTenant = new Map<string, Payment>();
  [...payments]
    .filter((p) => !p.voided_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .forEach((p) => { if (!latestByTenant.has(p.tenant_id)) latestByTenant.set(p.tenant_id, p); });

  const groups = new Map<string, Payment[]>();
  payments.forEach((p) => {
    const key = p.paid_on.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  });

  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}><h1>Payments</h1></div>
      {payments.length ? (
        [...groups.entries()].map(([month, rows]) => (
          <section className="stack-sm" key={month}>
            <div className="row">
              <h2>{formatDate(`${month}-01`).replace(/^1 /, "")}</h2>
              <span className="row-amount">{rupees(rows.filter((p) => !p.voided_at).reduce((s, p) => s + p.amount, 0))}</span>
            </div>
            <ul className="list">
              {rows.map((p) => (
                <PaymentRow key={p.id} payment={p} showTenant canUndo={canEdit && latestByTenant.get(p.tenant_id)?.id === p.id} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="empty">
          <h2>No payments yet</h2>
          <p className="muted">Open a room and record a payment. It will be saved here.</p>
          <Link className="btn btn-primary" href="/rooms">Go to rooms</Link>
        </div>
      )}
    </div>
  );
}
