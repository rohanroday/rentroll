import Link from "next/link";
import { redirect } from "next/navigation";
import { addTenant } from "@/app/actions";
import { Icon } from "@/components/icons";
import { TenantFields } from "@/components/tenant-form";
import { ActionForm, Field } from "@/components/ui";
import { getContext, getProperties } from "@/lib/data";

export const metadata = { title: "Add tenant · RentRoll" };

export default async function NewTenant({ searchParams }: PageProps<"/rooms/new">) {
  const { canEdit } = await getContext();
  if (!canEdit) redirect("/rooms");
  const { property, room } = await searchParams;
  const properties = await getProperties();
  const chosen = properties.find((p) => p.name === property) ?? properties[0];

  return (
    <div className="content narrow">
      <div className="page-head">
        <Link href="/rooms" className="back" aria-label="Back to rooms"><Icon name="back" size={24} /></Link>
        <h1>Add tenant</h1>
      </div>
      <ActionForm action={addTenant}>
        {properties.length > 1 ? (
          <Field label="Building">
            <select name="property_id" defaultValue={chosen.id}>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="property_id" value={chosen.id} />
        )}
        <Field label="Room number">
          <input name="room" required maxLength={12} autoComplete="off" defaultValue={typeof room === "string" ? room : ""} placeholder="101" />
        </Field>
        <TenantFields submit="Save tenant" />
      </ActionForm>
    </div>
  );
}
