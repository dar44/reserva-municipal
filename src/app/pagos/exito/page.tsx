import Link from "next/link";
import { PagoStatusWatcher } from "./PagoStatusWatcher";
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
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-3xl font-bold text-green-500">Pago completado</h1>
      <p>
        Hemos recibido correctamente tu pago. Estamos confirmando la {tipoLabel} con la
        pasarela de cobro para que aparezca como pagada en tu panel.
      </p>
      {pagoId ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Identificador interno del pago: {pagoId}
          </p>
          <PagoStatusWatcher pagoId={pagoId} tipo={tipoKey} />
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          Si necesitas ayuda para localizar el pago, contacta con el equipo de soporte.
        </p>
      )}
      <Link
        href={href}
        className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
      >
        {label}
      </Link>
    </div>
  );
}