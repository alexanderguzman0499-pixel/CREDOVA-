# GlobalTix — Ticket Resale Marketplace (MVP)

Global marketplace for reselling event tickets (concerts, sports, theater) with the lowest combined fee
in the category: **7% seller + 7% buyer (14% total)**, versus the 30-45% combined fee charged by most
generalist resale platforms and up to 15% on a single side for some official sports resale platforms.

> "GlobalTix" is a placeholder brand name used throughout the UI/copy so the product has something concrete to
> look at. Swap it for your real brand/domain before launch (see `src/components/Navbar.tsx`, `src/app/layout.tsx`
> metadata, and `src/app/page.tsx`).

## Why this architecture

- **Escrow, not instant payouts.** Buyer payments are captured to the platform's own Stripe balance
  (`src/app/api/orders/route.ts`), not sent straight to the seller. Funds only move to the seller's
  Stripe Connect Express account via an explicit `Transfer` once an escrow condition is met — either the
  buyer confirms the ticket was valid (`/api/orders/[id]/confirm`) or a post-event holding window elapses
  with no open refund (`/api/orders/[id]/release`, meant to be triggered by a cron job). This is the
  Stripe Connect "separate charges and transfers" pattern, and it's what makes real fund retention (and a
  buyer guarantee) possible — a "destination charge" would pay the seller immediately and defeat the purpose.
- **All-inclusive pricing.** `src/lib/fees.ts` is the single source of truth for the 7%/7% fee math, used by
  both the API and the UI so the price shown while browsing is exactly what gets charged at checkout.
- **Duplicate ticket detection.** Every uploaded ticket file is hashed (SHA-256) on upload
  (`src/lib/storage.ts`); a `UNIQUE` constraint on `Listing.fileHash` plus an explicit check in
  `POST /api/listings` rejects re-listing the same file, whether by the same seller or a different account.
- **Buyer guarantee / refunds.** `POST /api/orders/[id]/refund-request` auto-approves and immediately
  refunds (via Stripe, straight out of the still-held escrow balance) for invalid ticket / event cancelled /
  seller no-show. Anything else is queued for manual review.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 + PostgreSQL · Auth.js v5 (credentials) ·
Stripe + Stripe Connect (Express accounts).

## Local setup

1. **Database**: `docker compose up -d` (starts local Postgres), or point `DATABASE_URL` at any Postgres instance.
2. **Env vars**: `cp .env.example .env` and fill in `AUTH_SECRET` (`npx auth secret`) and Stripe test keys
   from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
3. **Install + migrate**:
   ```bash
   npm install
   npx prisma migrate dev
   npm run dev
   ```
4. Open http://localhost:3000.

### Stripe webhook (local)

Escrow status transitions (`payment_intent.succeeded`, Connect account updates) are driven by
`src/app/api/webhooks/stripe/route.ts`. Forward events to it locally with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

## What's built (MVP, per the original spec's priority order)

1. ✅ Buyer/seller auth (email + password, Auth.js v5, JWT sessions)
2. ✅ Publish & search ticket listings (`/sell/new`, `/events`, `/events/[id]`)
3. ✅ Stripe Connect escrow payments (Express onboarding + held funds + delayed transfer)
4. ✅ All-inclusive checkout flow (`/listings/[id]/checkout`, Stripe Payment Element)
5. ✅ Buyer + seller dashboard (`/dashboard`)
6. ✅ Guarantee/refund system (auto-refund for invalid ticket / cancelled event / no-show)
7. ✅ Duplicate ticket detection (file hash uniqueness)
8. Identity verification (KYC) and direct issuer integrations (Ticketmaster/AXS) are **Phase 2**,
   intentionally not built yet — see the legal note below on why issuer integration matters for real
   "reschedule" support.

## Legal — read before operating this commercially

This codebase implements the *product* the spec asked for, but ticket resale law is jurisdiction-specific
and contractual restrictions from ticket issuers are a business/legal risk, not a technical one. Have a
lawyer review, in particular:

- Anti-scalping / resale-price-cap laws that vary by state, province, or country.
- Reseller licensing requirements in some U.S. states.
- Ticket issuers' own terms of sale, which sometimes restrict resale outside their official channel —
  GlobalTix isn't a party to that contract, but sellers should be aware of it (see `/terms`).

`/terms`, `/privacy`, and `/refund-policy` contain drafted starting points for these policies — they are
not legal advice and must be reviewed before publishing.

## Known gaps / next steps

- The automatic escrow release (`/api/orders/[id]/release`) needs a scheduler (Vercel Cron or similar)
  hitting it once per order's `escrowReleaseAt`; nothing calls it automatically yet.
- Ticket file storage (`src/lib/storage.ts`) writes to local disk for development. Swap for S3/Cloudflare R2
  with private ACLs before deploying.
- No automated test suite yet (manual + Playwright smoke-tested during development).
- Multi-currency display beyond the `currency` field on each listing (FX conversion, localized formatting)
  is not implemented.
