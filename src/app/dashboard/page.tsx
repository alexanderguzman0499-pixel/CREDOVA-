import Link from "next/link";
import { redirect } from "next/navigation";

import { IdentityVerification } from "@/components/IdentityVerification";
import { OrderActions } from "@/components/OrderActions";
import { auth } from "@/lib/auth";
import { formatCents } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

const BUYER_ACTIONABLE_STATUSES = new Set(["PAID_ESCROW", "DELIVERED"]);

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const [user, purchases, listings, stripeConnect] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { identityVerified: true } }),
    prisma.order.findMany({
      where: { buyerId: session.user.id },
      include: { listing: { include: { event: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.findMany({
      where: { sellerId: session.user.id },
      include: { event: true, orders: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stripeConnectAccount.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My account</h1>

      <section className="mt-6">
        <IdentityVerification verified={user?.identityVerified ?? false} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-navy-900 dark:text-white">My purchases</h2>
        <div className="mt-4 space-y-3">
          {purchases.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{order.listing.event.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.listing.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(order.listing.event.eventDate).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCents(order.totalChargedCents, order.currency)}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-navy-700 dark:text-navy-300">{order.status}</p>
                </div>
              </div>
              {BUYER_ACTIONABLE_STATUSES.has(order.status) && <OrderActions orderId={order.id} />}
            </div>
          ))}
          {purchases.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You haven&apos;t bought any tickets yet.{" "}
              <Link href="/events" className="font-medium text-gold-700 hover:underline dark:text-gold-400">
                Explore events
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white">My listings</h2>
          <Link href="/sell/new" className="text-sm font-medium text-gold-700 hover:underline dark:text-gold-400">
            + New ticket
          </Link>
        </div>

        {!stripeConnect?.payoutsEnabled && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            You still need to set up your payout account to get paid for your sales.{" "}
            <Link href="/sell/onboarding" className="font-semibold underline">
              Set up now
            </Link>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{listing.event.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{listing.title}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  {formatCents(listing.pricePerTicketCents, listing.currency)}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {listing.status} · {listing.orders.length} order(s)
                </p>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">You haven&apos;t listed any tickets yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
