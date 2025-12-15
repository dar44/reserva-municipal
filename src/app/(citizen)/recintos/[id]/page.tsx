import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConfiguredCurrency, getReservaPriceValue } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import ReservationForm from "./ReservationForm";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { createSupabaseServerReadOnly } from "@/lib/supabaseServer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function RecintoDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerReadOnly();

  const { data: recinto } = await supabase
    .from("recintos")
    .select("id,name,description,ubication,state,image,image_bucket")
    .eq("id", id)
    .single();

  if (!recinto) return notFound();

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase);
  const imageUrl = getRecintoImageUrl(supabase, recinto.image, recinto.image_bucket, defaultImageUrl);

  const slots = Array.from({ length: 12 }, (_, i) => {
    const start = 8 + i;
    const end = start + 1;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(start)}:00-${pad(end)}:00`;
  });

  let priceLabel = "Pago";
  try {
    const currency = getConfiguredCurrency();
    const reservaPrice = getReservaPriceValue();
    priceLabel = formatCurrency(reservaPrice, currency);
  } catch {
    priceLabel = "Pago";
  }

  const isDisponible = recinto.state === "Disponible";

  return (
    <div className="container-padding section-spacing">
      <Link href="/recintos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver al listado
      </Link>

      <div className="grid md:grid-cols-2 gap-8 surface rounded-lg p-8 shadow-xl bg-gradient-to-br from-background to-surface">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-tertiary">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={recinto.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            "Sin imagen"
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{recinto.name}</h1>
              <Badge
                variant={isDisponible ? "default" : "secondary"}
                className={isDisponible ? "bg-success text-success-foreground" : "bg-error text-error-foreground"}
              >
                {recinto.state}
              </Badge>
            </div>

            <div className="space-y-3 text-secondary">
              <p><strong className="text-foreground">Ubicación:</strong> {recinto.ubication}</p>
              <p><strong className="text-foreground">Descripción:</strong> {recinto.description}</p>
              <p><strong className="text-foreground">Precio:</strong> <span className="text-primary font-semibold">{priceLabel}/hora</span></p>
            </div>
          </div>

          {isDisponible && (
            <div className="pt-4 border-t border-border">
              <ReservationForm recintoId={recinto.id} slots={slots} priceLabel={priceLabel} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}