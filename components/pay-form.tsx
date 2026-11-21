"use client";

import { useState } from "react";
import { recordPayment } from "@/app/actions";
import { rupees } from "@/lib/rent";
import { ActionForm, Field, Submit } from "./ui";

type Props = {
  tenantId: string;
  name: string;
  balance: number;
  expectedDue: string;
  expectedPaid: number;
  today: string;
  source: string;
};

export function PayForm({ tenantId, name, balance, expectedDue, expectedPaid, today, source }: Props) {
  const [kind, setKind] = useState<"full" | "part">("full");
  const [amount, setAmount] = useState("");
  const typed = Number(amount.replace(/[,₹\s]/g, ""));
  const shown = kind === "full" ? balance : typed;
  const valid = Number.isInteger(shown) && shown > 0 && shown <= balance;

  return (
    <ActionForm action={recordPayment}>
      <input type="hidden" name="tenant_id" value={tenantId} />
      <input type="hidden" name="balance" value={balance} />
      <input type="hidden" name="expected_due" value={expectedDue} />
      <input type="hidden" name="expected_paid" value={expectedPaid} />
      <input type="hidden" name="source" value={source} />

      <fieldset className="segmented">
        <legend>How much was received?</legend>
        <label>
          <input type="radio" name="kind" value="full" checked={kind === "full"} onChange={() => setKind("full")} />
          <span>Full {rupees(balance)}</span>
        </label>
        <label>
          <input type="radio" name="kind" value="part" checked={kind === "part"} onChange={() => setKind("part")} />
          <span>Part payment</span>
        </label>
      </fieldset>

      {kind === "part" && (
        <Field label="Amount received (₹)" hint={valid ? `${rupees(balance - shown)} will be left` : `Up to ${rupees(balance)}`}>
          <input name="amount" required autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      )}

      <div className="form-row">
        <Field label="Paid by">
          <select name="method" defaultValue="upi">
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Received on">
          <input name="paid_on" type="date" required max={today} defaultValue={today} />
        </Field>
      </div>

      <Submit pending="Recording…">{valid ? `Confirm ${rupees(shown)} from ${name}` : "Enter the amount"}</Submit>
    </ActionForm>
  );
}
