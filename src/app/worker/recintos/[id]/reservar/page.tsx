import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import ReservationForm from "./ReservationForm";
import { getConfiguredCurrency, getReservaPriceValue } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign } from "lucide-react";

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
      {/* Back link - consistencia con otras páginas */}
      <Link
        href="/worker/recintos"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header con gradient y metadata */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Reserva de {recinto.name}</h1>
          <p className="text-foreground-secondary mb-4">
            Completa los datos del ciudadano para crear la reserva
          </p>

          {/* Info badges - Ley de la Región Común */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={isDisponible ? "default" : "secondary"}
              className={isDisponible ? "bg-success text-success-foreground" : ""}
            >
              {recinto.state}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
              <MapPin className="w-4 h-4" />
              <span>{recinto.ubication}</span>
            </div>
            {priceLabel && (
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                <span>{priceLabel}/hora</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="surface p-6 rounded-xl border border-border shadow-md">
        <ReservationForm recintoId={recinto.id} />
      </div>
    </div>
  );
}