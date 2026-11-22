import { addProperty, signOut } from "@/app/actions";
import { ActionForm, Field, Submit } from "@/components/ui";
import { getContext, getProperties } from "@/lib/data";

export const metadata = { title: "Settings · RentRoll" };

export default async function More() {
  const { user, canEdit } = await getContext();
  const properties = await getProperties();
  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}><h1>Settings</h1></div>

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
