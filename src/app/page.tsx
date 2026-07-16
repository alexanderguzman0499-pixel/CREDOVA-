import Link from "next/link";

const trustPoints = [
  {
    title: "The lowest fee in the market",
    body: "7% for the seller + 7% for the buyer, all included from the first click. No surprises at checkout, unlike platforms that charge up to 15%.",
  },
  {
    title: "Your money, protected",
    body: "Every purchase is held in escrow until you confirm your ticket is valid. If anything goes wrong, you get an automatic refund.",
  },
  {
    title: "Anti-fraud verification",
    body: "Every ticket is scanned for duplicates before it's listed: the same ticket can't be sold twice on the platform.",
  },
  {
    title: "Global reach",
    body: "Concerts, sports, and theater in any country, with multi-currency support from day one.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-950">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-gold-500/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="mb-3 inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-300">
            The fairest ticket resale marketplace in the world
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Buy and sell any ticket, anywhere in the world, with the lowest fee in the market.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-200">
            Concerts, sports, and theater. 7% + 7% total fees, all-inclusive pricing from the start, and a refund
            guarantee if anything goes wrong.
          </p>

          <form action="/events" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              placeholder="Search an artist, team, or event..."
              className="w-full flex-1 rounded-full border border-navy-700 bg-navy-900 px-5 py-3 text-white placeholder:text-navy-400 shadow-sm focus:border-gold-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950 shadow-sm hover:bg-gold-400"
            >
              Search tickets
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/sell/new" className="font-medium text-gold-300 hover:underline">
              Have a ticket you can no longer use? Sell it here →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Why trust Global Ticket Resale</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-gold-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-gold-700"
            >
              <h3 className="font-semibold text-navy-900 dark:text-white">{point.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Platform</th>
                <th className="px-6 py-3">Approximate combined fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="bg-navy-900 font-semibold text-white">
                <td className="px-6 py-3">
                  Global Ticket Resale <span className="text-gold-400">★</span>
                </td>
                <td className="px-6 py-3 text-gold-300">14% (7% + 7%)</td>
              </tr>
              <tr>
                <td className="px-6 py-3">Other general resale platforms</td>
                <td className="px-6 py-3">~30% – 45%</td>
              </tr>
              <tr>
                <td className="px-6 py-3">Official international sports resale platforms</td>
                <td className="px-6 py-3">Up to ~15% on one side alone</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Reference comparison based on fees published by competitors at the time this platform was built;
          third-party fees may change.
        </p>
      </section>
    </div>
  );
}
