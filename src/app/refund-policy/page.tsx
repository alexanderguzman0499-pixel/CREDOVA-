export const metadata = { title: "Guarantee & Refunds — Global Ticket Resale" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Purchase Guarantee</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Reference draft for development; must be reviewed with legal counsel before publishing.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">When you get an automatic refund</h2>
          <ul className="list-disc pl-6">
            <li>The ticket turns out to be invalid or doesn&apos;t work at the event entrance.</li>
            <li>The event is cancelled and not rescheduled.</li>
            <li>The seller doesn&apos;t deliver the ticket in time.</li>
          </ul>
          <p>
            In these cases, your payment — held in escrow until that point — is automatically refunded to your
            original payment method.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">How escrow works</h2>
          <p>
            When you buy a ticket, your payment isn&apos;t transferred to the seller right away: it&apos;s held by the
            platform until you confirm the ticket worked, or until a waiting period after the event passes with no
            issues reported. Only then is the payment released to the seller.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Rescheduled events</h2>
          <p>
            If the event is rescheduled to a new date, your ticket remains valid for the new date, unless the
            organizer states otherwise.
          </p>
        </section>
      </div>
    </div>
  );
}
