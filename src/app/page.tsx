import Link from "next/link";

const trustPoints = [
  {
    title: "La comisión más baja del mercado",
    body: "7% al vendedor + 7% al comprador, todo incluido desde el primer clic. Sin sorpresas al pagar, a diferencia de otras plataformas que cobran hasta 15%.",
  },
  {
    title: "Tu dinero, protegido",
    body: "Cada compra queda retenida en custodia (escrow) hasta que confirmas que tu boleto es válido. Si algo sale mal, reembolso automático.",
  },
  {
    title: "Verificación anti-fraude",
    body: "Cada boleto se analiza para detectar duplicados antes de publicarse: el mismo boleto no puede venderse dos veces en la plataforma.",
  },
  {
    title: "Alcance global",
    body: "Conciertos, deportes y teatro en cualquier país, con soporte multi-moneda desde el primer día.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            La reventa de boletos más justa del mundo
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Compra y vende cualquier boleto, en cualquier parte del mundo, con la comisión más baja del mercado.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Conciertos, deportes y teatro. 7% + 7% de comisión total, precio todo incluido desde el inicio, y garantía
            de reembolso si algo sale mal.
          </p>

          <form action="/events" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              placeholder="Busca un artista, equipo o evento..."
              className="w-full flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Buscar boletos
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/sell/new" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              ¿Tienes un boleto que ya no puedes usar? Véndelo aquí →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Por qué confiar en Global Ticket Resale</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">{point.title}</h3>
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
                <th className="px-6 py-3">Plataforma</th>
                <th className="px-6 py-3">Comisión combinada aproximada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                <td className="px-6 py-3">Global Ticket Resale</td>
                <td className="px-6 py-3">14% (7% + 7%)</td>
              </tr>
              <tr>
                <td className="px-6 py-3">Otras plataformas de reventa generalistas</td>
                <td className="px-6 py-3">~30% – 45%</td>
              </tr>
              <tr>
                <td className="px-6 py-3">Plataformas oficiales de eventos deportivos internacionales</td>
                <td className="px-6 py-3">Hasta ~15% de un solo lado</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Comparación referencial basada en tarifas publicadas por competidores al momento de construir esta
          plataforma; las tarifas de terceros pueden cambiar.
        </p>
      </section>
    </div>
  );
}
