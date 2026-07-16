export const metadata = { title: "Terms of Service — Global Ticket Resale" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        This is a reference draft generated during product development and must be reviewed by a lawyer before
        publishing or operating commercially.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">1. What Global Ticket Resale is</h2>
          <p>
            Global Ticket Resale is a marketplace that connects buyers and sellers of event tickets. Global Ticket
            Resale is not the event organizer, does not issue tickets, and does not guarantee entry to the event
            beyond what is described in our Refund Guarantee.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">2. Fees</h2>
          <p>
            We charge a service fee of 7% to the buyer and 7% to the seller on the ticket&apos;s sale price (14%
            combined). The price shown to the buyer before payment is the final, all-inclusive price.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">3. Legal compliance and resale restrictions</h2>
          <p>
            Ticket resale laws vary by country, state, or province. Some jurisdictions impose resale price caps,
            reseller licensing requirements, or specific prohibitions. It is the seller&apos;s responsibility to ensure
            their ticket can legally be resold in the event&apos;s jurisdiction. Additionally, some ticket issuers (for
            example, sports or concert organizers) include clauses in their own terms of sale that restrict or
            prohibit resale outside their official channels; that restriction is contractual in nature between the
            original purchaser and the issuer, and Global Ticket Resale is not a party to that relationship, but
            recommends sellers review their ticket&apos;s terms before listing it.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">4. Escrow</h2>
          <p>
            Buyer payments are processed through Stripe and held by the platform until a release condition is met
            (buyer confirmation or expiration of the post-event holding window). Global Ticket Resale does not
            transfer funds directly to the business&apos;s own bank accounts before release.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">5. Fraudulent or duplicate tickets</h2>
          <p>
            Global Ticket Resale runs automatic duplicate verification (file/barcode hashing) to reduce the risk of
            the same ticket being sold more than once. Even so, Global Ticket Resale cannot absolutely guarantee the
            authenticity of every ticket; see the Refund Guarantee for the remedies available to buyers.
          </p>
        </section>
      </div>
    </div>
  );
}
