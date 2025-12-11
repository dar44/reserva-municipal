import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import ReservationForm from "./ReservationForm";
import { getConfiguredCurrency, getReservaPriceValue } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReservarRecinto({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: recinto } = await supabase
    .from("recintos")
    .select("id,name,ubication,state")
    .eq("id", id)
    .single();

  if (!recinto) return notFound();

  let priceLabel = "";
  try {
    priceLabel = formatCurrency(getReservaPriceValue(), getConfiguredCurrency());
  } catch {
    priceLabel = "";
  }

  const isDisponible = recinto.state === 'Disponible';

  return (
    <div className="container-padding section-spacing max-w-2xl mx-auto">
      <Link href="/worker/recintos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver al listado
      </Link>

      <div className="mb-8">
        <h1 className="mb-4">Reserva de {recinto.name}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant={isDisponible ? "default" : "secondary"}
            className={isDisponible ? "bg-success text-success-foreground" : ""}
          >
            {recinto.state}
          </Badge>
          <span className="text-secondary text-sm">{recinto.ubication}</span>
          {priceLabel && <span className="text-sm font-medium">{priceLabel}/hora</span>}
        </div>
      </div>

      <div className="surface p-6 rounded-lg">
        <ReservationForm recintoId={recinto.id} />
      </div>
    </div>
  );
}