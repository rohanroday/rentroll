import { addProperty, signOut } from "@/app/actions";
import { savePaymentDetails } from "@/app/tenant-actions";
import { ActionForm, Field, Submit } from "@/components/ui";
import { getContext, getProperties } from "@/lib/data";

export const metadata = { title: "Settings · RentRoll" };

export default async function More() {
  const { user, canEdit, isOwner, supabase, accountId } = await getContext();
  const properties = await getProperties();
  const { data: account } = await supabase.from("accounts").select("upi_id, upi_name").eq("id", accountId).single();
  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}><h1>Settings</h1></div>

      {isOwner && (
        <section className="panel stack-sm">
          <h2>UPI payment details</h2>
          <p className="muted">Tenants see this on their private payment page. Money goes directly to you.</p>
          <ActionForm action={savePaymentDetails}>
            <Field label="UPI ID" hint="Example: yourname@okicici">
              <input name="upi_id" maxLength={193} autoComplete="off" autoCapitalize="none" spellCheck={false} defaultValue={account?.upi_id ?? ""} />
            </Field>
            <Field label="Name shown to tenants" hint="Use the name on your UPI account.">
              <input name="upi_name" maxLength={60} autoComplete="off" defaultValue={account?.upi_name ?? ""} />
            </Field>
            <Submit variant="secondary">Save UPI details</Submit>
          </ActionForm>
        </section>
      )}

      <section className="stack-sm">
        <h2>Buildings</h2>
        <ul className="list">
          {properties.map((p) => (
            <li key={p.id}>
              <p className="row-title">{p.name}</p>
              {p.address && <p className="muted">{p.address}</p>}
            </li>
          ))}
        </ul>
      </section>

      {canEdit && (
        <section className="panel stack-sm">
          <h2>Add a building</h2>
          <ActionForm action={addProperty}>
            <Field label="Building or PG name"><input name="name" required maxLength={80} /></Field>
            <Field label="Address (optional)"><input name="address" maxLength={200} /></Field>
            <Submit variant="secondary">Add building</Submit>
          </ActionForm>
        </section>
      )}

      <section className="panel stack-sm">
        <h2>Your login</h2>
        <p className="muted" style={{ overflowWrap: "anywhere" }}>{user.email}</p>
        <form action={signOut}><button className="btn btn-secondary btn-block">Log out</button></form>
      </section>
    </div>
  );
}
