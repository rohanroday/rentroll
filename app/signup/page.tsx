import Link from "next/link";
import { signUp } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { ActionForm, Field, Submit } from "@/components/ui";

export const metadata = { title: "Create account · RentRoll" };

export default async function Signup({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";
  return (
    <AuthShell title="Create your account">
      <ActionForm action={signUp}>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Submit pending="Creating…">Create account</Submit>
      </ActionForm>
      <div className="auth-links">
        <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}>I already have an account</Link>
      </div>
    </AuthShell>
  );
}
