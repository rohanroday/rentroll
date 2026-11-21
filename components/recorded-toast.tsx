"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Back can restore a cached board, so remember which payments were already announced.
const announced = new Set<string>();

type Props = { paymentId: string; name: string; tenantId: string };

export function RecordedToast({ paymentId, name, tenantId }: Props) {
  const [show] = useState(() => !announced.has(paymentId));

  useEffect(() => {
    if (!show) return;
    announced.add(paymentId);

    // One-shot: Refresh must not announce the same payment again.
    const url = new URL(window.location.href);
    if (url.searchParams.has("recorded")) {
      url.searchParams.delete("recorded");
      window.history.replaceState(window.history.state, "", url);
    }

    const plate = document.querySelector<HTMLElement>("[data-just-paid]");
    if (!plate) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    plate.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    const timer = window.setTimeout(() => plate.classList.add("plate-just"), reduced ? 0 : 350);
    return () => window.clearTimeout(timer);
  }, [paymentId, show]);

  if (!show) return null;
  return (
    <p className="notice notice-ok notice-action" role="status">
      <span>Payment recorded for {name}.</span>
      <Link href={`/tenants/${tenantId}`}>View or undo</Link>
    </p>
  );
}
