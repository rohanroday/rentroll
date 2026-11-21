import { acceptInvite, signOut } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { ActionForm, Submit } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Accept invite · RentRoll", referrer: "no-referrer" as const };

export default async function Invite({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <AuthShell title="Join this RentRoll team">
      <div className="stack-sm">
        <p>You&apos;re logged in as <strong>{data.user?.email}</strong>. The invite must have been sent to this email.</p>
        <ActionForm action={acceptInvite.bind(null, token)}>
          <Submit pending="Joining…">Accept invite</Submit>
        </ActionForm>
        <form action={signOut}><button className="text-btn">Use a different email</button></form>
      </div>
    </AuthShell>
  );
}
