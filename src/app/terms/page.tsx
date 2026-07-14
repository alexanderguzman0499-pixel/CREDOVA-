export const metadata = { title: "Términos de servicio — GlobalTix" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Términos de servicio</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Este texto es un borrador de referencia generado para el desarrollo del producto y debe ser revisado por un
        abogado antes de publicarse o de operar comercialmente.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">1. Qué es GlobalTix</h2>
          <p>
            GlobalTix es un mercado (marketplace) que conecta a compradores y vendedores de boletos de eventos.
            GlobalTix no es el organizador del evento, no emite los boletos y no garantiza el ingreso al evento más
            allá de lo descrito en nuestra Garantía de Reembolso.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">2. Comisiones</h2>
          <p>
            Cobramos una comisión de servicio del 7% al comprador y 7% al vendedor sobre el precio de venta del
            boleto (14% combinado). El precio mostrado al comprador antes de pagar es el precio final, todo incluido.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">3. Cumplimiento legal y restricciones de reventa</h2>
          <p>
            Las leyes sobre reventa de boletos varían según el país, estado o provincia. Algunas jurisdicciones
            imponen límites al precio de reventa, requisitos de licencia para revendedores, o prohibiciones
            específicas. Es responsabilidad del vendedor asegurarse de que su boleto puede revenderse legalmente en
            la jurisdicción del evento. Adicionalmente, algunos emisores de boletos (por ejemplo, organizadores
            deportivos o de conciertos) incluyen cláusulas en sus propios términos de venta que restringen o prohíben
            la reventa fuera de sus canales oficiales; dicha restricción es de naturaleza contractual entre el
            comprador original y el emisor, y GlobalTix no es parte de esa relación, pero recomienda a los
            vendedores revisar los términos de su boleto antes de publicarlo.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">4. Custodia de fondos (escrow)</h2>
          <p>
            Los pagos de los compradores se procesan a través de Stripe y se retienen por la plataforma hasta que se
            cumple una condición de liberación (confirmación del comprador o vencimiento de la ventana de retención
            posterior al evento). GlobalTix no transmite fondos directamente a cuentas bancarias propias del
            negocio antes de la liberación.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">5. Boletos fraudulentos o duplicados</h2>
          <p>
            GlobalTix aplica verificación automática de duplicados (hash del archivo/código de barras) para reducir
            el riesgo de que un mismo boleto se venda más de una vez. Aun así, GlobalTix no puede garantizar de forma
            absoluta la autenticidad de cada boleto; ver la Garantía de Reembolso para los recursos disponibles al
            comprador.
          </p>
        </section>
      </div>
    </div>
  );
}
