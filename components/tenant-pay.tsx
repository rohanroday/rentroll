"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { submitTenantPayment } from "@/app/tenant-actions";
import { rupees } from "@/lib/rent";
import { upiAppLink, upiLink, upiQuery, type UpiApp } from "@/lib/upi";
import { Icon } from "./icons";
import { ActionForm, Field, Submit } from "./ui";

type Props = {
  token: string;
  balance: number;
  room: string;
  upiId: string | null;
  upiName: string;
};

const APP_BUTTONS: { app: UpiApp; label: string }[] = [
  { app: "gpay", label: "Google Pay" },
  { app: "phonepe", label: "PhonePe" },
  { app: "paytm", label: "Paytm" },
];

export function TenantPay({ token, balance, room, upiId, upiName }: Props) {
  const [method, setMethod] = useState<"upi" | "cash">(upiId ? "upi" : "cash");
  const [amountText, setAmountText] = useState(String(balance));
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const amount = Number(amountText.replace(/[,₹\s]/g, ""));
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= balance;
  const query = upiId && valid ? upiQuery(upiId, upiName, amount, room) : "";
  const link = query ? upiLink(query) : "";

  useEffect(() => {
    let live = true;
    if (!link) return;
    QRCode.toDataURL(link, { margin: 1, width: 440, errorCorrectionLevel: "M", color: { dark: "#10231e", light: "#ffffff" } })
      .then((url) => { if (live) setQr(url); })
      .catch(() => { if (live) setQr(""); });
    return () => { live = false; };
  }, [link]);

  const copy = async () => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ActionForm action={submitTenantPayment.bind(null, token)}>
      <Field label="Amount (₹)" hint={valid ? (amount < balance ? `${rupees(balance - amount)} will be left` : "Full balance") : `Enter up to ${rupees(balance)}`}>
        <input name="amount" required inputMode="numeric" value={amountText} onChange={(e) => setAmountText(e.target.value)} />
      </Field>

      <fieldset className="segmented">
        <legend>How are you paying?</legend>
        <label>
          <input type="radio" name="method" value="upi" disabled={!upiId} checked={method === "upi"} onChange={() => setMethod("upi")} />
          <span>{upiId ? "UPI" : "UPI not set up"}</span>
        </label>
        <label>
          <input type="radio" name="method" value="cash" checked={method === "cash"} onChange={() => setMethod("cash")} />
          <span>Cash</span>
        </label>
      </fieldset>

      {method === "upi" && upiId ? (
        <>
          <section className="upi-box" aria-label="UPI payment details">
            {valid && qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} width={220} height={220} alt={`UPI QR code to pay ${rupees(amount)} to ${upiName}`} />
            ) : (
              <div className="upi-qr-empty">{valid ? "Preparing QR…" : "Enter a valid amount"}</div>
            )}
            <p className="upi-payee">Paying <strong>{upiName}</strong></p>
            <div className="upi-id">
              <code>{upiId}</code>
              <button type="button" className="text-btn" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            </div>
            {link && (
              <div className="upi-apps">
                <p className="field-label">Pay with</p>
                <div className="upi-app-grid">
                  {APP_BUTTONS.map(({ app, label }) => (
                    <a
                      key={app}
                      className="btn btn-secondary btn-small"
                      href={link}
                      data-upi-app={app}
                      onClick={(e) => { e.currentTarget.href = upiAppLink(app, query, navigator.userAgent, window.location.href); }}
                    >
                      {label}
                    </a>
                  ))}
                  <a className="btn btn-secondary btn-small" href={link} data-upi-app="other">Other UPI app</a>
                </div>
                <p className="field-hint">If nothing opens, scan the QR or copy the UPI ID in your app.</p>
              </div>
            )}
            <p className="field-hint">Check the name in your UPI app before you pay.</p>
          </section>
          <Field label="UPI transaction number (UTR)" hint="12 digits, shown in your UPI app after paying.">
            <input name="utr" required inputMode="numeric" maxLength={14} autoComplete="off" placeholder="123456789012" />
          </Field>
          <Submit pending="Sending…">I&apos;ve paid, send for approval</Submit>
        </>
      ) : (
        <>
          <p className="notice notice-info cash-note"><Icon name="wallet" size={18} /> <span>Hand the cash to your landlord, then let them know here.</span></p>
          <Submit pending="Sending…">Tell landlord I paid cash</Submit>
        </>
      )}
    </ActionForm>
  );
}
