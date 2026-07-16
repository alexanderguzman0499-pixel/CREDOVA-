"use client";

import { useState } from "react";

export function IdentityVerification({ verified }: { verified: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startVerification() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/identity/start", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Couldn't start verification. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gold-300 bg-gold-50 p-4 text-sm dark:border-gold-800 dark:bg-gold-950/30">
        <span className="text-gold-600 dark:text-gold-400">✓</span>
        <span className="font-medium text-navy-900 dark:text-white">Your identity is verified</span>
        <span className="ml-auto rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-semibold text-navy-950">
          Verified
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="font-medium text-navy-900 dark:text-white">Get a Verified badge</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Verify your identity with a government ID to earn a Verified badge buyers see on your listings — it builds
        trust and can help your tickets sell faster. Takes about 2 minutes, handled securely by Stripe.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={startVerification}
        disabled={loading}
        className="mt-3 rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Verify my identity"}
      </button>
    </div>
  );
}
