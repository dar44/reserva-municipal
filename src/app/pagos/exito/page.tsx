import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type SearchParams = {
  pago?: string;
  tipo?: string;
};

export default async function PagoExitoPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pagoId = params.pago;
  const tipoKey = params.tipo === "inscripcion" ? "inscripcion" : "reserva";
  const tipoLabel = tipoKey === "inscripcion" ? "inscripción" : "reserva";
  let reservaHref: string | null = null;

  if (tipoKey === "reserva" && pagoId) {
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: pago } = await supabase
          .from("pagos")
          .select("reserva_id")
          .eq("id", pagoId)
          .eq("user_uid", user.id)
          .maybeSingle<{ reserva_id: number | null }>();

        if (pago?.reserva_id) {
          reservaHref = `/reservas/${pago.reserva_id}`;
        }
      }
    } catch {
      reservaHref = null;
    }
  }

  const href =
    tipoKey === "inscripcion"
      ? "/cursos"
      : reservaHref ?? "/reservas";
  const label =
    tipoKey === "inscripcion"
      ? "Volver a cursos"
      : reservaHref
        ? "Ver detalle de la reserva"
        : "Ver mis reservas";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card-base w-full max-w-lg text-center space-y-6 animate-fade-in-up">
        {/* Animated success icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-subtle">
          <svg
            className="h-10 w-10 text-success animate-scale-in delay-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-success">¡Pago completado!</h1>
          <p className="text-foreground-secondary">
            Tu {tipoLabel} ha sido registrada correctamente.
            Recibirás una confirmación por correo electrónico en los próximos minutos.
          </p>
        </div>

        {pagoId && (
          <p className="text-xs text-foreground-tertiary">
            Referencia de pago: <span className="font-mono">{pagoId}</span>
          </p>
        )}

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