import { redirect } from "next/navigation";
import { createAccount, signOut } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { ActionForm, Field, Submit } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Set up · RentRoll" };

export default async function Setup() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: member } = await supabase.from("members").select("account_id").eq("user_id", data.user.id).maybeSingle();
  if (member) redirect("/rooms");

  return (
    <AuthShell title="Name your building">
      <ActionForm action={createAccount}>
        <Field label="Building or PG name">
          <input name="property" required maxLength={80} autoFocus placeholder="Shanti Residency" />
        </Field>
        <Field label="Address (optional)">
          <input name="address" maxLength={200} autoComplete="street-address" />
        </Field>
        <Submit pending="Setting up…">Continue to add rooms</Submit>
      </ActionForm>
      <form action={signOut} className="auth-links"><button className="text-btn">Log out</button></form>
    </AuthShell>
  );
}
