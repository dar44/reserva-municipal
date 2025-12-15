import Image from "next/image";
import Link from "next/link";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { createSupabaseServerReadOnly } from "@/lib/supabaseServer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyRecintosState } from "@/components/ui/empty-state";
import { MapPin, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  search?: string;
};

export default async function RecintosPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerReadOnly();

  const params = await searchParams;

  let query = supabase
    .from("recintos")
    .select("id,name,description,ubication,state,image,image_bucket")
    .order("name");

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data: recintos } = await query;

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase);

  const currency = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  const pricePerHour = 500;

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Recintos Disponibles</h1>
          <p className="text-foreground-secondary">
            Espacios municipales para tus eventos y actividades
          </p>
        </div>
      </div>

      <form
        className="flex gap-3 mb-8"
        action="/recintos"
      >
        <input
          type="text"
          name="search"
          placeholder="Buscar por nombre..."
          defaultValue={params.search}
          className="input-base flex-1 max-w-md"
        />
        <Button type="submit">
          Buscar
        </Button>
        <Button asChild variant="outline">
          <Link href="/recintos">Limpiar</Link>
        </Button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recintos?.map(r => {
          const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl);
          const isDisponible = r.state === 'Disponible';
          return (
            <Link
              key={r.id}
              href={`/recintos/${r.id}`}
              className="
                surface rounded-xl overflow-hidden 
                shadow-md hover:shadow-2xl 
                transition-all duration-300 
                hover:scale-[1.02] hover:-translate-y-1
                flex flex-col
                border border-transparent hover:border-primary/20
                group
              "
            >
              {/* Image with overlay */}
              <div className="relative h-48 bg-muted flex items-center justify-center text-tertiary overflow-hidden">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={r.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  "Sin imagen"
                )}

                {/* Badge de estado */}
                <Badge
                  className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg ${isDisponible
                    ? "bg-success text-success-foreground"
                    : "bg-error text-error-foreground"
                    }`}
                >
                  {r.state}
                </Badge>
              </div>

              {/* Content with better hierarchy */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-3">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {r.name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-2">
                    {r.description}
                  </p>

                  {/* Location with icon */}
                  <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs line-clamp-1">{r.ubication}</span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Price destacado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground-tertiary text-sm">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">Por hora</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {currency.format(pricePerHour)}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-end gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    <span>Ver recinto</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Empty state with animation */}
        {!recintos?.length && <EmptyRecintosState />}
      </div>
    </div>
  );
}
