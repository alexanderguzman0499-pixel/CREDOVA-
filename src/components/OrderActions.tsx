"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const REFUND_REASONS = [
  { value: "INVALID_TICKET", label: "The ticket isn't valid" },
  { value: "EVENT_CANCELLED", label: "The event was cancelled" },
  { value: "SELLER_NO_SHOW", label: "The seller didn't deliver the ticket" },
  { value: "OTHER", label: "Other reason" },
];

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [reason, setReason] = useState(REFUND_REASONS[0].value);
  const [message, setMessage] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "Couldn't confirm.");
      return;
    }
    router.refresh();
  }

  async function requestRefund() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/orders/${orderId}/refund-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "Couldn't request the refund.");
      return;
    }
    setShowRefund(false);
    router.refresh();
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={confirm}
          disabled={busy}
          className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          Confirm everything is fine
        </button>
        <button
          onClick={() => setShowRefund((v) => !v)}
          disabled={busy}
          className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Request a refund
        </button>
      </div>

      {showRefund && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            {REFUND_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={requestRefund}
            disabled={busy}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            Confirm request
          </button>
        </div>
      )}

      {message && <p className="text-xs text-red-600">{message}</p>}
    </div>
  );
}
