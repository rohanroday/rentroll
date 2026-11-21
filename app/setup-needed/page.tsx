import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Connect Supabase · RentRoll" };

export default function SetupNeeded() {
  return (
    <AuthShell title="Connect Supabase to continue">
      <p className="notice notice-info">
        RentRoll is running, but it isn&apos;t connected to a database yet. Add your Supabase details to the
        <strong> .env.local</strong> file, then restart the app.
      </p>
    </AuthShell>
  );
}
