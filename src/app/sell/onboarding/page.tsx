"use client";

import { useEffect, useState } from "react";

interface Status {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export default function SellerOnboardingPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stripe/connect/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStatus(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function startOnboarding() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Set up your seller payouts</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        We use Stripe Connect to pay you securely. Your banking details never pass through our servers.
      </p>

      {status && (
        <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 p-5 text-sm dark:border-slate-800">
          <StatusRow label="Account created" ok={status.connected} />
          <StatusRow label="Information submitted" ok={status.detailsSubmitted} />
          <StatusRow label="Can receive payouts" ok={status.payoutsEnabled} />
        </div>
      )}

      <button
        onClick={startOnboarding}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : status?.payoutsEnabled ? "Update payout information" : "Set up payouts with Stripe"}
      </button>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className={ok ? "font-semibold text-gold-600 dark:text-gold-400" : "font-semibold text-slate-400"}>
        {ok ? "Done" : "Pending"}
      </span>
    </div>
  );
}
