import Link from "next/link";
import { notFound } from "next/navigation";
import OpenStreetMapView from "@/components/OpenStreetMapView";
import DeleteButton from "../DeleteButton";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ReservaDetail = {
  id: number;
  start_at: string;
  end_at: string;
  price: number | string;
  status: string;
  paid: boolean;
  observations: string | null;
  recintos: {
    name: string | null;
    ubication: string | null;
  } | null;
};

export default async function ReservaDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    notFound();
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mt-20 text-center space-y-2">
        <p>🔒 Inicia sesión primero</p>
        <Link href="/login" className="text-blue-400 underline">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  const { data: reserva } = await supabase
    .from("reservas")
    .select(
      `id,start_at,end_at,price,status,paid,observations,recintos(name,ubication)`
    )
    .eq("id", id)
    .eq("user_uid", user.id)
    .maybeSingle<ReservaDetail>();

  if (!reserva) {
    notFound();
  }

  const currency = getConfiguredCurrency();
  const priceValue = Number(reserva.price ?? 0);
  const priceLabel = priceValue > 0 ? formatCurrency(priceValue, currency) : "Gratis";
  const showMap = reserva.paid && !!reserva.recintos?.ubication;

  return (
    <div className="space-y-6">
      <Link href="/reservas" className="text-sm underline">
        ← Volver
      </Link>

      <div className="bg-gray-800 rounded-lg p-6 shadow space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {reserva.recintos?.name ?? "Detalle de la reserva"}
            </h1>
            <p className="text-sm text-gray-300">
              {new Date(reserva.start_at).toLocaleString()} – {" "}
              {new Date(reserva.end_at).toLocaleString()}
            </p>
          </div>
          {reserva.status === "activa" && <DeleteButton id={reserva.id} type="Recinto" />}
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400">Estado</dt>
            <dd className="font-medium capitalize">{reserva.status}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Pago</dt>
            <dd className="font-medium">{reserva.paid ? "Pagado" : "Pendiente"}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Precio</dt>
            <dd className="font-medium">{priceLabel}</dd>
          </div>
          {reserva.observations && (
            <div className="sm:col-span-2">
              <dt className="text-gray-400">Observaciones</dt>
              <dd className="font-medium text-gray-200">{reserva.observations}</dd>
            </div>
          )}
        </dl>

        {showMap && reserva.recintos?.ubication && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-200">
              Cómo llegar a tu reserva
            </p>
            <OpenStreetMapView
              address={reserva.recintos.ubication}
              title={
                reserva.recintos.name
                  ? `Ubicación de ${reserva.recintos.name}`
                  : "Ubicación de la reserva"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}