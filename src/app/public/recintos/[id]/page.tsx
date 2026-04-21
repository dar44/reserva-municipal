import { Suspense } from 'react'
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConfiguredCurrency, getReservaPriceValue } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export const revalidate = 60;

function DetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 surface rounded-lg p-8 shadow-xl bg-gradient-to-br from-background to-surface animate-pulse">
      <div className="h-80 bg-muted rounded-lg w-full"></div>
      <div className="space-y-6 w-full">
        <div className="h-10 bg-muted rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </div>
        <div className="h-24 bg-muted rounded mt-6"></div>
      </div>
    </div>
  )
}

async function RecintoDetailContent({ id }: { id: string }) {
  const supabase = supabaseAdmin;

  const { data: recinto } = await supabase
    .from("recintos")
    .select("id,name,description,ubication,state,image,image_bucket")
    .eq("id", id)
    .single();

  if (!recinto) return notFound();

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase);
  const imageUrl = getRecintoImageUrl(supabase, recinto.image, recinto.image_bucket, defaultImageUrl);

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
    <>
      <Breadcrumbs
        homeHref="/public/recintos"
        items={[
          { label: 'Recintos', href: '/public/recintos' },
          { label: recinto.name }
        ]}
      />

      <div className="grid md:grid-cols-2 gap-8 surface rounded-lg p-8 shadow-xl bg-gradient-to-br from-background to-surface mt-6">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-tertiary">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={recinto.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
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
              <div className="surface rounded-lg p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <h2 className="text-lg font-semibold mb-2">¿Quieres reservar este recinto?</h2>
                <p className="text-sm text-foreground-secondary mb-4">
                  Inicia sesión o regístrate para poder realizar una reserva de este espacio.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/login?next=/recintos/${recinto.id}`}>
                      <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/signup">
                      <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                      Registrarse
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default async function PublicRecintoDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <div className="container-padding section-spacing">
      <Suspense fallback={
        <>
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-6" />
          <DetailSkeleton />
        </>
      }>
        <RecintoDetailContent id={id} />
      </Suspense>
    </div>
  );
}
