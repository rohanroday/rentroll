"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getContext } from "@/lib/data";
import { ownerRequestEmail, sendEmail, tenantResultEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/server";
import type { FormState } from "./actions";

const MESSAGES: Record<string, string> = {
  link_invalid: "This link is no longer valid. Please contact your landlord.",
  link_closed: "This rent period is already closed. Please contact your landlord if that looks wrong.",
  request_pending: "Your payment is already waiting for your landlord's approval.",
  too_many_requests: "Too many attempts today. Please contact your landlord.",
  bad_amount: "Enter an amount between ₹1 and the balance due.",
  bad_method: "Choose UPI or cash.",
  upi_unavailable: "UPI isn't set up for this property. Choose cash or contact your landlord.",
  bad_utr: "Enter the 12-digit UPI transaction number.",
  duplicate_utr: "This transaction number has already been used.",
  not_allowed: "You have View only access, so you can't make changes.",
  request_done: "This payment was already reviewed.",
  request_stale: "The balance changed after this was reported. Reject it and ask the tenant to report it again.",
};

const friendly = (message: string) => {
  const code = Object.keys(MESSAGES).find((key) => message.includes(key));
  return code ? MESSAGES[code] : "Something went wrong. Please try again.";
};

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const hashOf = (token: string) => createHash("sha256").update(token).digest("hex");

type RequestDetails = {
  amount: number;
  method: "upi" | "cash";
  utr: string | null;
  account_id: string;
  tenant_id: string;
};

// A failed notification must never undo or block a recorded decision.
async function notifyOwners(requestId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("payment_requests")
      .select("amount, method, utr, account_id, tenant_id")
      .eq("id", requestId)
      .single();
    if (!data) return;
    const request = data as RequestDetails;
    const [{ data: account }, { data: tenant }, { data: members }] = await Promise.all([
      admin.from("accounts").select("name").eq("id", request.account_id).single(),
      admin.from("tenants").select("name, rooms(label)").eq("id", request.tenant_id).single(),
      admin.from("members").select("email").eq("account_id", request.account_id).eq("role", "full"),
    ]);
    if (!account || !tenant || !members) return;
    const room = tenant.rooms as unknown as { label: string };
    const message = ownerRequestEmail({
      accountName: account.name,
      tenantName: tenant.name,
      room: room.label,
      amount: request.amount,
      method: request.method,
      utr: request.utr,
    });
    for (const member of members) await sendEmail(member.email, message.subject, message.html, message.text);
  } catch (e) {
    console.error("Owner payment notification failed:", e);
  }
}

async function notifyTenant(requestId: string, approved: boolean, reason?: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("payment_requests").select("amount, tenant_id").eq("id", requestId).single();
    if (!data) return;
    const { data: tenant } = await admin
      .from("tenants")
      .select("name, email, rooms(label, properties(name))")
      .eq("id", data.tenant_id)
      .single();
    if (!tenant?.email) return;
    const room = tenant.rooms as unknown as { label: string; properties: { name: string } };
    const message = tenantResultEmail({
      property: room.properties.name,
      tenantName: tenant.name,
      room: room.label,
      amount: data.amount,
      approved,
      reason,
    });
    await sendEmail(tenant.email, message.subject, message.html, message.text);
  } catch (e) {
    console.error("Tenant payment notification failed:", e);
  }
}

// ===== Tenant's private link =====
export async function submitTenantPayment(token: string, _: FormState, form: FormData): Promise<FormState> {
  const method = text(form, "method");
  const amount = Number(text(form, "amount").replace(/[,₹\s]/g, ""));
  if (!Number.isInteger(amount) || amount < 1) return { error: "Enter the amount in whole rupees." };
  const utr = text(form, "utr").replace(/\s/g, "");
  if (method === "upi" && !/^\d{12}$/.test(utr)) return { error: MESSAGES.bad_utr };

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("tenant_submit_payment", {
    p_hash: hashOf(token),
    p_amount: amount,
    p_method: method,
    p_utr: method === "upi" ? utr : null,
  });
  if (error) return { error: friendly(error.message) };
  await notifyOwners(data as string);
  revalidatePath(`/t/${token}`);
  return { ok: "Sent to your landlord for approval." };
}

// ===== Owner =====
export async function approveRequest(id: string): Promise<FormState> {
  const { supabase } = await getContext();
  const { error } = await supabase.rpc("approve_payment_request", { p_request: id });
  if (error) return { error: friendly(error.message) };
  await notifyTenant(id, true);
  revalidatePath("/", "layout");
  return { ok: "Payment approved." };
}

export async function rejectRequest(id: string, _: FormState, form: FormData): Promise<FormState> {
  const reason = text(form, "reason").slice(0, 200);
  const { supabase } = await getContext();
  const { error } = await supabase.rpc("reject_payment_request", { p_request: id, p_reason: reason });
  if (error) return { error: friendly(error.message) };
  await notifyTenant(id, false, reason);
  revalidatePath("/", "layout");
  return { ok: "Payment rejected." };
}

export async function savePaymentDetails(_: FormState, form: FormData): Promise<FormState> {
  const upiId = text(form, "upi_id");
  const upiName = text(form, "upi_name");
  if (upiId && !/^[A-Za-z0-9._-]{2,128}@[A-Za-z0-9]{2,64}$/.test(upiId)) {
    return { error: "Enter a valid UPI ID, like name@okicici." };
  }
  if (upiName.length > 60) return { error: "Keep the name under 60 letters." };
  const { supabase, accountId, isOwner } = await getContext();
  if (!isOwner) return { error: "Only the owner can change payment details." };
  const { error } = await supabase
    .from("accounts")
    .update({ upi_id: upiId || null, upi_name: upiName || null })
    .eq("id", accountId);
  if (error) return { error: "We couldn't save that. Please try again." };
  revalidatePath("/more");
  return { ok: upiId ? "UPI details saved." : "UPI details removed." };
}

export async function setTenantReminders(id: string, _: FormState, form: FormData): Promise<FormState> {
  const on = text(form, "on") === "yes";
  if (on && text(form, "consent") !== "yes") return { error: "Tick the box to confirm the tenant agreed to rent emails." };
  const { supabase } = await getContext();
  const { data, error } = await supabase.from("tenants").update({ reminders_enabled: on }).eq("id", id).select("id");
  if (error) {
    return { error: error.code === "23514" ? "Add this tenant's email address first." : MESSAGES.not_allowed };
  }
  if (!data.length) return { error: MESSAGES.not_allowed };
  revalidatePath(`/tenants/${id}`);
  return { ok: on ? "Tenant emails are on." : "Tenant emails are off." };
}
