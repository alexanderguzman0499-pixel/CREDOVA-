import Stripe from "stripe";

// Falls back to a placeholder at build time (e.g. static analysis of route
// handlers) so `next build` doesn't require real secrets. Any actual API
// call with the placeholder key will fail loudly at request time if
// STRIPE_SECRET_KEY hasn't been configured in the deployment environment.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});
