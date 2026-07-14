export const metadata = { title: "Privacidad — GlobalTix" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Política de privacidad</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Borrador de referencia para desarrollo. Debe revisarse con asesoría legal (incluyendo cumplimiento de GDPR,
        CCPA u otras leyes aplicables según los países donde operes) antes de publicarse.
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">Datos que recopilamos</h2>
          <p>
            Nombre, correo electrónico, contraseña (almacenada como hash), archivos de boletos que subes para la
            venta, e información de pago procesada directamente por Stripe (GlobalTix nunca almacena números de
            tarjeta completos).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Archivos de boletos</h2>
          <p>
            Los archivos de boletos que subes se almacenan en un espacio privado, no público, y solo se usan para
            verificar duplicados y validar la venta.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Terceros</h2>
          <p>Compartimos datos con Stripe (procesamiento de pagos y verificación de identidad) según sea necesario para operar la plataforma.</p>
        </section>
      </div>
    </div>
  );
}
