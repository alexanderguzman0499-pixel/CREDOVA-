# Deploy checklist — Global Ticket Resale on Vercel

This repo could not be deployed directly from the agent session (outbound access to
`api.vercel.com` is blocked by this environment's network policy — see the conversation
that produced this file). Deploying through the Vercel dashboard's Git integration works
around that entirely, and is the better long-term setup anyway: every push to the
connected branch deploys automatically, with no CLI step required.

## 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `alexanderguzman0499-pixel/CREDOVA-`.
3. Set the **Production Branch** to `claude/ticket-resale-marketplace-lsoxso` (or merge it
   into `main` first and use that — your call).
4. Framework preset: Next.js (auto-detected). Leave build/output settings default — the
   `vercel-build` script in `package.json` already runs `prisma generate && prisma migrate
   deploy && next build`, so Vercel will apply pending database migrations on every deploy
   automatically. `postinstall` also runs `prisma generate` so local `npm install` stays
   in sync.

## 2. Environment variables

Set these in the Vercel project (Settings → Environment Variables) **before** the first
deploy. Values were generated for `AUTH_SECRET` and `CRON_SECRET` in the chat session that
produced this checklist — copy them from there rather than regenerating, unless you'd
rather cut fresh ones (`openssl rand -base64 32` / `openssl rand -hex 32`).

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | A production PostgreSQL connection string. Easiest options with a free tier: [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres) — both installable as a Vercel integration from the project's **Storage** tab, which auto-populates this var for you. |
| `AUTH_SECRET` | Generated in chat, or `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Your production URL once Vercel assigns/you set a domain, e.g. `https://your-domain.vercel.app`. |
| `STRIPE_SECRET_KEY` | [Stripe dashboard → API keys](https://dashboard.stripe.com/apikeys). Use a **test** key until you're ready to take real payments, then swap to live. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page as above. |
| `STRIPE_WEBHOOK_SECRET` | Create a webhook endpoint in the Stripe dashboard pointed at `https://<your-domain>/api/webhooks/stripe` (events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`) — Stripe shows the signing secret after you create it. |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL`. Used to build Stripe Connect onboarding return links. |
| `CRON_SECRET` | Generated in chat, or `openssl rand -hex 32`. Also see `vercel.json` — Vercel sends this automatically as `Authorization: Bearer <value>` when it calls `/api/cron/release-escrow`. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Cloudflare dashboard → R2 Object Storage → create a private bucket → Manage R2 API Tokens → create a token scoped to Object Read & Write on that bucket. Required in production — see below. |

## 3. Ticket file storage (Cloudflare R2)

`src/lib/storage.ts` uploads ticket files to Cloudflare R2 when the four `R2_*` variables
above are set — required in production, since Vercel's serverless functions have no
persistent local disk (uploaded files would otherwise be lost). Without those variables
set, it silently falls back to local disk, which is fine for local dev but means "sell a
ticket" would appear to work in production while quietly losing every uploaded file. The
bucket should stay private (no public access) — files are served to the app via the R2
API, never a public URL.

## 4. After the first deploy

- Visit the deployed URL and confirm the home page and `/events` load without a 500 (that
  confirms `DATABASE_URL` and the auto-run migration worked).
- Update the Stripe webhook endpoint URL if you changed the domain after creating it.
- Register a test seller + buyer account and run through Stripe Connect onboarding in test
  mode to confirm the escrow flow end-to-end before going live.
