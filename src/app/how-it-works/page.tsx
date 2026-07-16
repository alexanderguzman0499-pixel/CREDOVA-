export const metadata = { title: "Cómo funciona — Global Ticket Resale" };

const steps = [
  {
    title: "1. Busca o publica",
    body: "Compradores buscan boletos por evento, ciudad o fecha. Vendedores publican en minutos subiendo su boleto (PDF o captura).",
  },
  {
    title: "2. Pago en custodia",
    body: "Al comprar, el dinero queda retenido de forma segura por la plataforma — no llega al vendedor de inmediato.",
  },
  {
    title: "3. Vas al evento",
    body: "Usas tu boleto con normalidad. Si algo falla (boleto inválido, evento cancelado, vendedor que no entrega), te reembolsamos.",
  },
  {
    title: "4. Se libera el pago",
    body: "Confirmas que todo salió bien (o pasa la ventana de espera post-evento) y el vendedor recibe su pago automáticamente.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Cómo funciona</h1>
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
