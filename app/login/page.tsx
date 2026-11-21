import Link from "next/link";
import { signIn } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { Icon } from "@/components/icons";
import { ActionForm, Field, Submit } from "@/components/ui";

export const metadata = { title: "Log in · RentRoll" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";
  const signup = nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";
  return (
    <AuthShell title="Log in">
      {error === "link" && (
        <p className="notice notice-error" role="alert" style={{ marginBottom: 16 }}>
          <Icon name="alert" size={18} />
          <span>That link has expired or was opened in another browser. Log in, or request a new link.</span>
        </p>
      )}
      <ActionForm action={signIn}>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" />
        </Field>
        <Submit pending="Logging in…">Log in</Submit>
      </ActionForm>
      <div className="auth-links">
        <Link href={signup}>Create a free account</Link>
        <Link href="/forgot">Forgot password?</Link>
      </div>
    </AuthShell>
  );
}
