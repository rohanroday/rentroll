"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getContext } from "@/lib/data";
import { inviteEmail, sendEmail, siteUrl } from "@/lib/email";
import { todayIST } from "@/lib/rent";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string } | null;

const VIEW_ONLY = "You have View only access, so you can't make changes.";

const MESSAGES: Record<string, string> = {
  not_allowed: VIEW_ONLY,
  moved_out: "This tenant has moved out.",
  already_recorded: "This payment was already recorded. Check the latest balance.",
  bad_amount: "Enter an amount between ₹1 and the balance left.",
  future_date: "The payment date can't be in the future.",
  already_undone: "This payment was already undone.",
  not_latest: "Undo this tenant's newer payment first.",
  rent_changed: "The rent was changed after this payment, so it can't be undone.",
  already_in_account: "This login already belongs to a RentRoll account. Use a different email.",
  invite_invalid: "This invite is no longer valid. Ask the owner to send a new one.",
  invite_wrong_email: "This invite was sent to a different email. Log in with that email.",
  email_not_confirmed: "Confirm your email first, then open this invite again.",
  invite_limit: "You've reached today's invite limit. Please try again tomorrow.",
};

const friendly = (message: string, fallback = "Something went wrong. Please try again.") => {
  const code = Object.keys(MESSAGES).find((key) => message.includes(key));
  if (code) return MESSAGES[code];
  if (message.includes("row-level security") || message.includes("permission denied")) return VIEW_ONLY;
  return fallback;
};

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.").refine(isRealDate, "Choose a valid date.");

const tenantFields = z.object({
  name: z.string().min(1, "Enter the tenant's name.").max(60, "Keep the name under 60 letters."),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, ""))
    .refine((v) => v === "" || /^[6-9]\d{9}$/.test(v), "Enter a 10-digit mobile number, or leave it empty."),
  email: z.union([z.literal(""), z.email("Enter a valid email, or leave it empty.")]),
  rent: z.coerce.number("Enter the monthly rent.").int("Enter rent in whole rupees.").min(1, "Enter the monthly rent.").max(10_000_000, "That rent looks too high."),
  next_due: dateField,
});

const readTenant = (form: FormData) =>
  tenantFields.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    email: text(form, "email"),
    rent: text(form, "rent").replace(/[,₹\s]/g, ""),
    next_due: text(form, "next_due"),
  });

// ===== Login =====
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error) {
    return {
      error: error.code === "email_not_confirmed"
        ? "Confirm your email first. Check your inbox for the link."
        : "That email or password is wrong.",
    };
  }
  redirect(safeNext(text(form, "next")));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  const next = safeNext(text(form, "next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.code === "weak_password" ? "Choose a stronger password." : "We couldn't create that account. Try again." };
  if (data.session) redirect(next);
  return { ok: `Check ${email} and tap the confirmation link to finish.` };
}

export async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/callback?next=/auth/reset` });
  return { ok: "If that email has an account, a reset link is on its way." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "That reset link has expired. Request a new one." };
  redirect("/rooms");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ===== Setup and properties =====
export async function createAccount(_: FormState, form: FormData): Promise<FormState> {
  const property = text(form, "property");
  if (!property || property.length > 80) return { error: "Enter your building or PG name." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_account", { p_property: property, p_address: text(form, "address") });
  if (error) return { error: friendly(error.message) };
  redirect("/rooms/new");
}

export async function addProperty(_: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  if (!name || name.length > 80) return { error: "Enter the building or PG name." };
  const { supabase, accountId } = await getContext();
  const { error } = await supabase
    .from("properties")
    .insert({ account_id: accountId, name, address: text(form, "address") || null });
  if (error) return { error: error.code === "23505" ? "You already have a building with that name." : friendly(error.message) };
  revalidatePath("/", "layout");
  return { ok: `${name} added.` };
}

// ===== Tenants =====
export async function addTenant(_: FormState, form: FormData): Promise<FormState> {
  const parsed = readTenant(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const label = text(form, "room");
  const propertyId = text(form, "property_id");
  if (!label || label.length > 12) return { error: "Enter a room number of up to 12 characters." };
  if (!propertyId) return { error: "Choose a building." };

  const { supabase, accountId } = await getContext();
  const { data: existing, error: findError } = await supabase
    .from("rooms")
    .select("id")
    .eq("property_id", propertyId)
    .ilike("label", label.replace(/[%_\\]/g, "\\$&"))
    .maybeSingle();
  if (findError) return { error: friendly(findError.message) };

  let roomId = existing?.id as string | undefined;
  let createdRoom = false;
  if (!roomId) {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ account_id: accountId, property_id: propertyId, label })
      .select("id")
      .single();
    if (error) return { error: friendly(error.message) };
    roomId = data.id as string;
    createdRoom = true;
  }

  const { phone, email, ...rest } = parsed.data;
  const { error } = await supabase.from("tenants").insert({
    ...rest,
    phone: phone || null,
    email: email || null,
    account_id: accountId,
    room_id: roomId,
    due_day: Number(rest.next_due.slice(8)),
  });
  if (error) {
    if (createdRoom) await supabase.from("rooms").delete().eq("id", roomId);
    return { error: error.code === "23505" ? `Room ${label} already has a tenant.` : friendly(error.message) };
  }
  revalidatePath("/", "layout");
  redirect("/rooms");
}

export async function updateTenant(id: string, _: FormState, form: FormData): Promise<FormState> {
  const parsed = readTenant(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { supabase } = await getContext();
  const { phone, email, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from("tenants")
    .update({ ...rest, phone: phone || null, email: email || null, due_day: Number(rest.next_due.slice(8)) })
    .eq("id", id)
    .select("id");
  if (error) {
    return { error: error.code === "23514" ? "Rent can't be lower than what this tenant has already paid this cycle." : friendly(error.message) };
  }
  if (!data.length) return { error: VIEW_ONLY };
  revalidatePath("/", "layout");
  redirect(`/tenants/${id}`);
}

export async function moveOut(id: string, _: FormState, form: FormData): Promise<FormState> {
  if (text(form, "confirm") !== "yes") return { error: "Tick the box to confirm this tenant has moved out." };
  const { supabase } = await getContext();
  const { data, error } = await supabase.from("tenants").update({ ended_on: todayIST() }).eq("id", id).select("id");
  if (error) return { error: friendly(error.message) };
  if (!data.length) return { error: VIEW_ONLY };
  revalidatePath("/", "layout");
  redirect("/rooms");
}

// ===== Payments =====
export async function recordPayment(_: FormState, form: FormData): Promise<FormState> {
  const tenantId = text(form, "tenant_id");
  const balance = Number(text(form, "balance"));
  const kind = text(form, "kind");
  const amount = kind === "full" ? balance : Number(text(form, "amount").replace(/[,₹\s]/g, ""));
  if (!Number.isInteger(amount) || amount < 1) return { error: "Enter the amount received in whole rupees." };
  if (amount > balance) return { error: "That's more than the balance left." };
  const paidOn = text(form, "paid_on");
  if (!dateField.safeParse(paidOn).success) return { error: "Choose the date you received the money." };
  const method = text(form, "method");
  if (!["upi", "cash", "bank", "other"].includes(method)) return { error: "Choose how it was paid." };

  const { supabase } = await getContext();
  const { data: payment, error } = await supabase.rpc("record_payment", {
    p_tenant: tenantId,
    p_amount: amount,
    p_expected_due: text(form, "expected_due"),
    p_expected_paid: Number(text(form, "expected_paid")),
    p_method: method,
    p_paid_on: paidOn,
    p_source: text(form, "source") === "email" ? "email" : "app",
  });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/", "layout");
  redirect(`/rooms?recorded=${encodeURIComponent((payment as { id: string }).id)}`);
}

export async function undoPayment(id: string): Promise<FormState> {
  const { supabase } = await getContext();
  const { error } = await supabase.rpc("undo_payment", { p_payment: id });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/", "layout");
  return { ok: "Payment undone." };
}

// ===== Team =====
export async function inviteMember(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const role = text(form, "role") === "full" ? "full" : "view";
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email address." };

  const { supabase, accountId, accountName, isOwner } = await getContext();
  if (!isOwner) return { error: "Only the owner can invite people." };
  const { data: member } = await supabase.from("members").select("user_id").eq("account_id", accountId).ilike("email", email.replace(/[%_\\]/g, "\\$&")).maybeSingle();
  if (member) return { error: "That person is already on your team." };

  await supabase.from("invites").delete().eq("account_id", accountId).ilike("email", email.replace(/[%_\\]/g, "\\$&")).is("accepted_at", null);
  const token = randomBytes(32).toString("base64url");
  const { data: invite, error } = await supabase
    .from("invites")
    .insert({ account_id: accountId, email, role, token_hash: createHash("sha256").update(token).digest("hex") })
    .select("id")
    .single();
  if (error) return { error: friendly(error.message) };

  const message = inviteEmail(accountName, role, `${siteUrl()}/invite/${token}`);
  try {
    await sendEmail(email, message.subject, message.html, message.text);
  } catch {
    await supabase.from("invites").delete().eq("id", invite.id);
    return { error: "We couldn't send that invite email. Try again." };
  }
  revalidatePath("/team");
  return { ok: `Invite sent to ${email}.` };
}

export async function cancelInvite(id: string) {
  const { supabase, isOwner } = await getContext();
  if (!isOwner) return;
  await supabase.from("invites").delete().eq("id", id);
  revalidatePath("/team");
}

export async function changeRole(userId: string, role: "full" | "view") {
  const { supabase, isOwner, accountId } = await getContext();
  if (!isOwner) return;
  await supabase.from("members").update({ role }).eq("account_id", accountId).eq("user_id", userId);
  revalidatePath("/team");
}

export async function removeMember(userId: string) {
  const { supabase, isOwner, accountId } = await getContext();
  if (!isOwner) return;
  await supabase.from("members").delete().eq("account_id", accountId).eq("user_id", userId);
  revalidatePath("/team");
}

export async function acceptInvite(token: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_invite", {
    p_hash: createHash("sha256").update(token).digest("hex"),
  });
  if (error) return { error: friendly(error.message) };
  redirect("/rooms");
}
