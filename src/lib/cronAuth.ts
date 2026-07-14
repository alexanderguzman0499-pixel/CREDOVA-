/**
 * Verifies the Vercel Cron `Authorization: Bearer <CRON_SECRET>` header.
 * Vercel automatically attaches this header to requests it sends to cron
 * routes when a `CRON_SECRET` env var is configured on the project, so this
 * doubles as auth for Vercel-triggered runs and for manual/ops-triggered
 * calls that pass the same secret.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured (e.g. local dev) — allow

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}
