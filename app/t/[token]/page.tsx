import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { setTenantEmails } from "@/app/tenant-actions";
import { Icon } from "@/components/icons";
import { TenantPay } from "@/components/tenant-pay";
import { formatDate, rupees } from "@/lib/rent";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pay rent · RentRoll",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Info = {
  state: "invalid" | "closed" | "open";
  tenant_name: string;
  room: string;
  property: string;
  due: string;
  balance: number;
  upi_id: string | null;
  upi_name: string;
  emails_on: boolean;
  opted_out: boolean;
  request_status: "pending" | "approved" | "rejected" | "undone" | null;
  request_amount: number | null;
  request_method: "upi" | "cash" | null;
  reject_reason: string | null;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="tenant-page">
      <header className="tenant-brand"><Icon name="rooms" size={22} /> RentRoll</header>
      <div className="tenant-body">{children}</div>
    </main>
  );
}

export default async function TenantPayment({ params }: PageProps<"/t/[token]">) {
  const { token } = await params;
  const valid = /^[A-Za-z0-9_-]{32,64}$/.test(token);
  const { data } = valid
    ? await createAdminClient().rpc("tenant_link_info", { p_hash: createHash("sha256").update(token).digest("hex") })
    : { data: null };
  const info = data as Info | null;

  if (!info || info.state === "invalid") {
    return (
      <Shell>
        <section className="panel stack-sm">
          <h1>This link isn&apos;t valid</h1>
          <p className="muted">Please use the latest rent email, or contact your landlord.</p>
        </section>
      </Shell>
    );
  }

  const pending = info.request_status === "pending";
  const canPay = info.state === "open" && !pending;

  return (
    <Shell>
      <section className="tenant-card">
        <span className="plate-no">Room {info.room}</span>
        <h1>{info.tenant_name}</h1>
        <p className="tenant-state">{info.property}</p>
        {info.state === "open" && (
          <>
            <p className="tenant-amount">{rupees(info.balance)}</p>
            <p className="tenant-state">Due on {formatDate(info.due)}</p>
          </>
        )}
      </section>

      {info.state === "closed" && (
        <p className="notice notice-info">This rent period is closed. If you still need to pay, please contact your landlord.</p>
      )}

      {pending && (
        <section className="panel stack-sm" role="status">
          <h2>Waiting for approval</h2>
          <p className="muted">
            You reported {rupees(info.request_amount ?? 0)} by {info.request_method === "upi" ? "UPI" : "cash"}. Your rent counts as paid after your landlord approves it.
          </p>
        </section>
      )}

      {info.state === "open" && info.request_status === "rejected" && (
        <p className="notice notice-error" role="alert">
          <Icon name="alert" size={18} />
          <span>Your last payment wasn&apos;t confirmed.{info.reject_reason ? ` Reason: ${info.reject_reason}.` : ""} Please contact your landlord or report it again.</span>
        </p>
      )}

      {canPay && (
        <section className="panel">
          <TenantPay token={token} balance={info.balance} room={info.room} upiId={info.upi_id} upiName={info.upi_name} />
        </section>
      )}

      <form action={setTenantEmails.bind(null, token, info.opted_out)} className="tenant-optout">
        <span className="muted">{info.opted_out ? "Rent emails are off." : "Don't want these reminders?"}</span>
        <button className="text-btn">{info.opted_out ? "Turn rent emails on" : "Stop rent emails"}</button>
      </form>
    </Shell>
  );
}
