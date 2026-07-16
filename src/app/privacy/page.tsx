export const metadata = { title: "Privacy — Global Ticket Resale" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Reference draft for development. Must be reviewed with legal counsel (including GDPR, CCPA, or other
        applicable laws depending on the countries you operate in) before publishing.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">Data we collect</h2>
          <p>
            Name, email, password (stored as a hash), ticket files you upload for sale, and payment information
            processed directly by Stripe (Global Ticket Resale never stores full card numbers).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Ticket files</h2>
          <p>
            Ticket files you upload are stored in a private, non-public space and are only used to verify duplicates
            and validate the sale.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Third parties</h2>
          <p>We share data with Stripe (payment processing and identity verification) as needed to operate the platform.</p>
        </section>
      </div>
    </div>
  );
}
