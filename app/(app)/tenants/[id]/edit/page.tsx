import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateTenant } from "@/app/actions";
import { Icon } from "@/components/icons";
import { TenantFields } from "@/components/tenant-form";
import { ActionForm } from "@/components/ui";
import { getContext, type Tenant } from "@/lib/data";

export const metadata = { title: "Edit tenant · RentRoll" };

export default async function EditTenant({ params }: PageProps<"/tenants/[id]/edit">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, canEdit } = await getContext();
  if (!canEdit) redirect(`/tenants/${id}`);
  const { data } = await supabase.from("tenants").select("*").eq("id", id).is("ended_on", null).maybeSingle();
  if (!data) notFound();
  const tenant = data as Tenant;

  return (
    <div className="content narrow">
      <div className="page-head">
        <Link href={`/tenants/${id}`} className="back" aria-label={`Back to ${tenant.name}`}><Icon name="back" size={24} /></Link>
        <h1>Edit {tenant.name}</h1>
      </div>
      <ActionForm action={updateTenant.bind(null, id)}>
        <TenantFields values={tenant} submit="Save changes" />
      </ActionForm>
    </div>
  );
}
