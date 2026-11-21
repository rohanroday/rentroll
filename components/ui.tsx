"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";
import { Icon } from "./icons";

export function Submit({
  children,
  pending,
  variant = "primary",
}: {
  children: ReactNode;
  pending?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const status = useFormStatus();
  return (
    <button type="submit" className={`btn btn-${variant}`} disabled={status.pending} aria-busy={status.pending}>
      {status.pending ? (pending ?? "Saving…") : children}
    </button>
  );
}

export function ActionForm({
  action,
  children,
  className = "form",
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {state?.error && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} /><span>{state.error}</span></p>}
      {state?.ok && <p className="notice notice-ok" role="status">{state.ok}</p>}
      {children}
    </form>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
