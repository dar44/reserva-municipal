import Image from 'next/image'
import Link from 'next/link'
import { getPublicStorageUrl } from '@/lib/storage'
import { createSupabaseServerReadOnly } from '@/lib/supabaseServer'
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
  search?: string;
};

export default async function CursosPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createSupabaseServerReadOnly();

  const params = await searchParams;

  let query = supabase
    .from('cursos')
    .select(
      'id,name,description,price,begining_date,end_date,image,image_bucket,state'
    )
    .eq('state', 'Disponible')
    .order('begining_date', { ascending: true })

  if (params.from) {
    query = query.gte("begining_date", params.from);
  }
  if (params.to) {
    query = query.lte("end_date", params.to);
  }
  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data: cursos } = await query

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  const currency = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  return (
    <div className="container-padding section-spacing">
      <h1 className="mb-8">Cursos Disponibles</h1>

      <form
        className="flex flex-wrap gap-3 mb-8"
        action="/cursos"
      >
        <input
          type="text"
          name="search"
          placeholder="Buscar por nombre..."
          defaultValue={params.search}
          className="input-base flex-1 min-w-[200px]"
        />
        <input
          type="date"
          name="from"
          defaultValue={params.from}
          className="input-base"
          placeholder="Desde"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to}
          className="input-base"
          placeholder="Hasta"
        />
        <Button type="submit">
          Filtrar
        </Button>
        <Button asChild variant="outline">
          <Link href="/cursos">Limpiar</Link>
        </Button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosWithImages?.map(c => (
          <Link
            key={c.id}
            href={`/cursos/${c.id}`}
            className="surface rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col group"
          >
            <div className="relative h-48 bg-muted flex items-center justify-center text-tertiary overflow-hidden">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <span className="text-sm">Sin imagen disponible</span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{c.name}</h2>
                <p className="text-sm text-secondary line-clamp-2">
                  {c.description}
                </p>
              </div>
              <div className="mt-4 text-sm text-secondary flex justify-between items-center">
                <span className="font-semibold text-foreground">{currency.format(c.price || 0)}</span>
                <span className="text-sm">
                  {c.begining_date} - {c.end_date}
                </span>
              </div>
              <div className="mt-3 text-sm text-primary text-right">
                Ver más →
              </div>
            </div>
          </Link>
        ))}
        {!cursosWithImages?.length && (
          <p className="text-secondary col-span-full text-center py-12">
            No se han encontrado cursos disponibles con los filtros seleccionados.
          </p>
        )}
      </div>
    </div>
  );
}