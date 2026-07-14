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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configura tus pagos como vendedor</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Usamos Stripe Connect para pagarte de forma segura. Tus datos bancarios nunca pasan por nuestros servidores.
      </p>

      {status && (
        <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 p-5 text-sm dark:border-slate-800">
          <StatusRow label="Cuenta creada" ok={status.connected} />
          <StatusRow label="Información enviada" ok={status.detailsSubmitted} />
          <StatusRow label="Puede recibir pagos" ok={status.payoutsEnabled} />
        </div>
      )}

      <button
        onClick={startOnboarding}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Redirigiendo…" : status?.payoutsEnabled ? "Actualizar información de pago" : "Configurar pagos con Stripe"}
      </button>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className={ok ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>
        {ok ? "Listo" : "Pendiente"}
      </span>
    </div>
  );
}
