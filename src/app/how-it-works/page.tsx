export const metadata = { title: "How it works — Global Ticket Resale" };

const steps = [
  {
    title: "1. Search or list",
    body: "Buyers search for tickets by event, city, or date. Sellers list in minutes by uploading their ticket (PDF or screenshot).",
  },
  {
    title: "2. Payment in escrow",
    body: "When you buy, the money is held securely by the platform — it doesn't reach the seller right away.",
  },
  {
    title: "3. You go to the event",
    body: "Use your ticket as normal. If anything goes wrong (invalid ticket, cancelled event, seller no-show), we refund you.",
  },
  {
    title: "4. Payment is released",
    body: "You confirm everything went fine (or the post-event holding window passes) and the seller receives their payment automatically.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">How it works</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold text-navy-900 dark:text-white">{step.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
