import Link from "next/link";
import { requestReset } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { ActionForm, Field, Submit } from "@/components/ui";

export const metadata = { title: "Reset password · RentRoll" };

export default function Forgot() {
  return (
    <AuthShell title="Reset your password">
      <ActionForm action={requestReset}>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" inputMode="email" />
        </Field>
        <Submit pending="Sending…">Send reset link</Submit>
      </ActionForm>
      <div className="auth-links"><Link href="/login">Back to log in</Link></div>
    </AuthShell>
  );
}
