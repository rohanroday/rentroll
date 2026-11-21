import { resetPassword } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { ActionForm, Field, Submit } from "@/components/ui";

export const metadata = { title: "New password · RentRoll" };

export default function Reset() {
  return (
    <AuthShell title="Choose a new password">
      <ActionForm action={resetPassword}>
        <Field label="New password" hint="At least 8 characters.">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Submit>Save password</Submit>
      </ActionForm>
    </AuthShell>
  );
}
