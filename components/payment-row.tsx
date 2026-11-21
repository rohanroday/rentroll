"use client";

import { useActionState, useState } from "react";
import { undoPayment } from "@/app/actions";
import type { Payment } from "@/lib/data";
import { formatDate, rupees } from "@/lib/rent";
import { Icon } from "./icons";

const METHOD: Record<string, string> = { upi: "UPI", cash: "Cash", bank: "Bank", other: "Other" };

export function PaymentRow({ payment, canUndo, showTenant }: { payment: Payment; canUndo: boolean; showTenant: boolean }) {
  const [state, action, pending] = useActionState(undoPayment.bind(null, payment.id), null);
  const [asking, setAsking] = useState(false);
  const voided = !!payment.voided_at;
  return (
    <li className={voided ? "is-voided" : undefined}>
      <div className="row">
        <div className="row-main">
          <p className="row-title">{showTenant ? `${payment.tenant_name} · Room ${payment.room_label}` : formatDate(payment.paid_on)}</p>
          <p className="muted">
            {showTenant ? `${formatDate(payment.paid_on)} · ` : ""}{METHOD[payment.method]}
            {payment.balance_left > 0 ? ` · ${rupees(payment.balance_left)} left` : " · Rent complete"}
            {voided ? " · Undone" : ""}
          </p>
        </div>
        <span className="row-amount">{rupees(payment.amount)}</span>
      </div>
      {canUndo && !voided && (
        <div className="inline-actions">
          {asking ? (
            <form action={action}>
              <button className="text-btn danger" disabled={pending}>{pending ? "Undoing…" : "Yes, undo payment"}</button>
              <button type="button" className="text-btn" onClick={() => setAsking(false)}>Keep it</button>
            </form>
          ) : (
            <button type="button" className="text-btn" onClick={() => setAsking(true)}>Undo</button>
          )}
        </div>
      )}
      {state?.error && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} /><span>{state.error}</span></p>}
    </li>
  );
}
