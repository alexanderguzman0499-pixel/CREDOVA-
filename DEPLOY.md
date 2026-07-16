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
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional — enables "Continue with Google". See setup steps below. |
| `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET` | Optional — enables "Continue with Facebook". See setup steps below. |

## 3. Social login (Google + Facebook)

`/login` and `/register` show "Continue with Google" / "Continue with Facebook" buttons.
They're inert (click does nothing) until the corresponding env vars above are set — this is
intentional graceful degradation, not a bug, so shipping without them doesn't break sign-up.

**Google**
1. [Google Cloud Console](https://console.cloud.google.com/) → create/select a project →
   **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Authorized redirect URI: `https://<your-domain>/api/auth/callback/google` (and
   `http://localhost:3000/api/auth/callback/google` if you also want it working locally).
4. Copy the generated **Client ID** → `AUTH_GOOGLE_ID`, and **Client secret** → `AUTH_GOOGLE_SECRET`.
5. You'll also need to fill out the **OAuth consent screen** (app name, support email, logo)
   — Google shows an "unverified app" warning to users until you submit it for verification,
   which is fine for testing but should be done before real launch.

**Facebook**
1. [Meta for Developers](https://developers.facebook.com/) → **My Apps → Create App** →
   choose "Consumer" or "Business" use case.
2. Add the **Facebook Login** product.
3. In Facebook Login → Settings, set **Valid OAuth Redirect URIs** to
   `https://<your-domain>/api/auth/callback/facebook`.
4. App Settings → Basic: copy **App ID** → `AUTH_FACEBOOK_ID`, and **App Secret** →
   `AUTH_FACEBOOK_SECRET`.
5. The app starts in **Development Mode**, where only accounts you've added as testers/admins
   can log in. Submit it for **App Review** (Facebook Login permissions) before real users can
   sign in with it.

Both providers link to an existing email/password account automatically if the email matches
(`allowDangerousEmailAccountLinking: true` in `src/lib/auth.ts`) — safe here since Google and
Facebook both verify the account's email before handing it to us.

## 4. Ticket file storage (Cloudflare R2)

`src/lib/storage.ts` uploads ticket files to Cloudflare R2 when the four `R2_*` variables
above are set — required in production, since Vercel's serverless functions have no
persistent local disk (uploaded files would otherwise be lost). Without those variables
set, it silently falls back to local disk, which is fine for local dev but means "sell a
ticket" would appear to work in production while quietly losing every uploaded file. The
bucket should stay private (no public access) — files are served to the app via the R2
API, never a public URL.

## 5. After the first deploy

- Visit the deployed URL and confirm the home page and `/events` load without a 500 (that
  confirms `DATABASE_URL` and the auto-run migration worked).
- Update the Stripe webhook endpoint URL if you changed the domain after creating it.
- Register a test seller + buyer account and run through Stripe Connect onboarding in test
  mode to confirm the escrow flow end-to-end before going live.

## 6. Troubleshooting: "No git sources are allowed in production"

If Production deployments get blocked with this exact message (visible on the deployment
page in a red "Deployment Blocked" box), it's Vercel's **Deployment Policies** (Beta)
feature — see [vercel.com/docs/deployments/deployment-policy](https://vercel.com/docs/deployments/deployment-policy).

What normally fixes it:

1. Project → Settings → Build and Deployment → **Git Sources** card. If it's set to
   **Override** with an empty rule for Production, either add the correct source
   (provider GitHub, org `alexanderguzman0499-pixel`, repo `CREDOVA-`) or delete the rule
   entirely, then Save.
2. Repeat for the **Deployment Sources** card just below it.
3. If neither has a blocking rule (or switching both back to **Inherit from Team**
   doesn't help either) and the team-level policy settings show nothing restrictive,
   this is a stuck/stale policy on Vercel's backend, not something fixable from the UI —
   contact Vercel support with the project name, the exact block message, and confirmation
   that Git/Deployment Sources show no active restriction. Don't bother repeatedly hitting
   "Redeploy" on an already-blocked deployment — it always returns "This deployment can
   not be redeployed. Please try again from a fresh commit," which is a separate,
   unrelated limitation (redeploy only works on deployments that weren't blocked).
