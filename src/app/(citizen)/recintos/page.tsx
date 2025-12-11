import Image from "next/image";
import Link from "next/link";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";
import { createSupabaseServerReadOnly } from "@/lib/supabaseServer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <h1 className="mb-8">Recintos Disponibles</h1>

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
              className="surface rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="relative h-48 bg-muted flex items-center justify-center text-tertiary overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={r.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  "Sin imagen"
                )}
              </div>
              <div className="p-5 space-y-3">
                <Badge
                  variant={isDisponible ? "default" : "secondary"}
                  className={isDisponible ? "bg-success text-success-foreground" : "bg-error text-error-foreground"}
                >
                  {r.state}
                </Badge>
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{r.name}</h2>
                <p className="text-sm text-secondary line-clamp-2">{r.description}</p>
                <p className="text-sm text-tertiary">{r.ubication}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{currency.format(pricePerHour)}/hora</span>
                  <span className="text-sm text-primary">Ver más →</span>
                </div>
              </div>
            </Link>
          );
        })}
        {!recintos?.length && (
          <p className="text-secondary col-span-full text-center py-12">
            No se han encontrado recintos con los filtros seleccionados.
          </p>
        )}
      </div>
    </div>
  );
}