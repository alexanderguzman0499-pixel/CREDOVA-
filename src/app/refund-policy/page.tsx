export const metadata = { title: "Garantía y reembolsos — Global Ticket Resale" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Garantía de compra</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Borrador de referencia para desarrollo; debe revisarse con asesoría legal antes de publicarse.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">Cuándo hay reembolso automático</h2>
          <ul className="list-disc pl-6">
            <li>El boleto resulta inválido o no funciona en la entrada del evento.</li>
            <li>El evento se cancela y no se reprograma.</li>
            <li>El vendedor no entrega el boleto a tiempo.</li>
          </ul>
          <p>
            En estos casos, tu pago —retenido en custodia hasta ese momento— se reembolsa automáticamente a tu
            método de pago original.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Cómo funciona la custodia (escrow)</h2>
          <p>
            Cuando compras un boleto, tu pago no se transfiere de inmediato al vendedor: se retiene en la plataforma
            hasta que confirmas que el boleto funcionó, o hasta que pasa un período de espera después del evento sin
            que se reporte ningún problema. Solo entonces se libera el pago al vendedor.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Eventos reprogramados</h2>
          <p>
            Si el evento se reprograma para una nueva fecha, tu boleto sigue siendo válido para la nueva fecha,
            salvo que el organizador indique lo contrario.
          </p>
        </section>
      </div>
    </div>
  );
}
