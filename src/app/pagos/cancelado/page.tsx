import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  pago?: string;
  tipo?: string;
};

export default async function PagoCanceladoPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tipo = params.tipo === "inscripcion" ? "inscripción" : "reserva";
  const href = params.tipo === "inscripcion" ? "/cursos" : "/reservas";
  const label = params.tipo === "inscripcion" ? "Volver a cursos" : "Volver a reservas";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card-base w-full max-w-lg text-center space-y-6 animate-fade-in-up">
        {/* Warning icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-subtle">
          <svg
            className="h-10 w-10 text-warning animate-scale-in delay-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-warning">Pago cancelado</h1>
          <p className="text-foreground-secondary">
            El proceso de pago se ha cancelado. Tu {tipo} continuará pendiente
            hasta que completes el pago. Puedes volver a intentarlo cuando quieras.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {label}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}