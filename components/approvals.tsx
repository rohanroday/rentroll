"use client";

import { useActionState, useState } from "react";
import { approveRequest, rejectRequest } from "@/app/tenant-actions";
import { rupees } from "@/lib/rent";
import { Icon } from "./icons";

export type Approval = {
  id: string;
  name: string;
  room: string;
  amount: number;
  method: "upi" | "cash";
  utr: string | null;
  when: string;
};

function Row({ item, canEdit }: { item: Approval; canEdit: boolean }) {
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [approved, approve, approving] = useActionState(approveRequest.bind(null, item.id), null);
  const [rejected, reject, rejecting] = useActionState(rejectRequest.bind(null, item.id), null);
  const error = approved?.error ?? rejected?.error;

  return (
    <li>
      <div className="row">
        <div className="row-main">
          <p className="row-title">{item.name} · Room {item.room}</p>
          <p className="muted">{item.method === "upi" ? `UPI · ${item.utr}` : "Cash"} · {item.when}</p>
        </div>
        <span className="row-amount">{rupees(item.amount)}</span>
      </div>

      {canEdit && mode === "idle" && (
        <div className="approval-actions">
          <button type="button" className="btn btn-primary btn-small" onClick={() => setMode("approve")}>Approve</button>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setMode("reject")}>Reject</button>
        </div>
      )}

      {canEdit && mode === "approve" && (
        <form action={approve} className="approval-confirm">
          <p>{item.method === "upi" ? "Have you checked this payment in your bank or UPI app?" : "Have you received this cash?"}</p>
          <div className="approval-actions">
            <button className="btn btn-primary btn-small" disabled={approving}>{approving ? "Approving…" : `Yes, approve ${rupees(item.amount)}`}</button>
            <button type="button" className="btn btn-secondary btn-small" disabled={approving} onClick={() => setMode("idle")}>Cancel</button>
          </div>
        </form>
      )}

      {canEdit && mode === "reject" && (
        <form action={reject} className="approval-confirm">
          <label className="field">
            <span className="field-label">Reason for the tenant (optional)</span>
            <input name="reason" maxLength={200} placeholder="Payment not received" />
          </label>
          <div className="approval-actions">
            <button className="btn btn-danger btn-small" disabled={rejecting}>{rejecting ? "Rejecting…" : "Reject payment"}</button>
            <button type="button" className="btn btn-secondary btn-small" disabled={rejecting} onClick={() => setMode("idle")}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} /><span>{error}</span></p>}
    </li>
  );
}

export function Approvals({ items, canEdit }: { items: Approval[]; canEdit: boolean }) {
  if (!items.length) return null;
  return (
    <section className="approvals" id="approvals" aria-labelledby="approvals-title">
      <h2 id="approvals-title">Waiting for approval ({items.length})</h2>
      <p className="muted">Tenants reported these payments. They count only after approval.</p>
      <ul className="list">
        {items.map((item) => <Row key={item.id} item={item} canEdit={canEdit} />)}
      </ul>
    </section>
  );
}
