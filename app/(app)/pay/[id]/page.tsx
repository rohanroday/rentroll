import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { PayForm } from "@/components/pay-form";
import { getContext, type Tenant } from "@/lib/data";
import { balanceOf, formatDate, rupees, todayIST } from "@/lib/rent";

export const metadata = { title: "Record payment · RentRoll" };

export default async function PayPage({ params, searchParams }: PageProps<"/pay/[id]">) {
  const { id } = await params;
  const { due, from } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, canEdit } = await getContext();
  const { data } = await supabase.from("tenants").select("*, rooms(label)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const tenant = data as Tenant & { rooms: { label: string } };
  const stale = typeof due === "string" && due !== tenant.next_due;

  let body;
  if (!canEdit) {
    body = <p className="notice notice-error" role="alert"><Icon name="alert" size={18} /><span>You have View only access, so you can&apos;t record payments. Ask the owner to do this.</span></p>;
  } else if (tenant.ended_on) {
    body = <p className="notice notice-info">{tenant.name} has moved out.</p>;
  } else if (stale) {
    body = (
      <div className="stack-sm">
        <p className="notice notice-ok" role="status">
          The rent due on {formatDate(due)} is already recorded. {tenant.name}&apos;s next rent is due on {formatDate(tenant.next_due)}.
        </p>
        <Link className="btn btn-secondary" href={`/tenants/${tenant.id}`}>View {tenant.name}</Link>
      </div>
    );
  } else {
    body = (
      <PayForm
        tenantId={tenant.id}
        name={tenant.name}
        balance={balanceOf(tenant)}
        expectedDue={tenant.next_due}
        expectedPaid={tenant.paid_so_far}
        today={todayIST()}
        source={from === "email" ? "email" : "app"}
      />
    );
  }

  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}>
        <Link href={`/tenants/${tenant.id}`} className="back" aria-label={`Back to ${tenant.name}`}><Icon name="back" size={24} /></Link>
        <h1>Record payment</h1>
      </div>
      <section className="tenant-card">
        <span className="plate-no">Room {tenant.rooms.label}</span>
        <h2 style={{ marginTop: 8, fontSize: "1.375rem" }}>{tenant.name}</h2>
        <p className="tenant-state">{rupees(balanceOf(tenant))} due on {formatDate(tenant.next_due)}</p>
      </section>
      {body}
    </div>
  );
}
