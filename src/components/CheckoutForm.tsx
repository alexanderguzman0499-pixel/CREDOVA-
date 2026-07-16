"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export function CheckoutForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createOrder() {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't start the purchase.");
        return;
      }
      setClientSecret(data.clientSecret);
      setOrderId(data.order.id);
    }
    createOrder();
  }, [listingId]);

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>;
  }

  if (!clientSecret || !orderId) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Preparing your secure payment…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} onSuccess={() => router.push(`/dashboard?order=${orderId}`)} />
    </Elements>
  );
}

function PaymentForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?order=${orderId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "The payment couldn't be processed.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {submitting ? "Processing…" : "Pay securely"}
      </button>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Your payment is held in escrow until you confirm the ticket is valid. Processed by Stripe.
      </p>
    </form>
  );
}
