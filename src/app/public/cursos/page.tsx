import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicStorageUrl } from '@/lib/storage'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyCoursesState } from '@/components/ui/empty-state'
import { CourseGridSkeleton } from '@/components/ui/skeletons'
import { Calendar, DollarSign, ArrowRight } from 'lucide-react'

export const revalidate = 30;

type SearchParams = {
  from?: string;
  to?: string;
  search?: string;
};

async function CursosList({ params }: { params: SearchParams }) {
  const supabase = supabaseAdmin;
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('cursos')
    .select(
      'id,name,description,price,begining_date,end_date,image,image_bucket,state'
    )
    .eq('state', 'Disponible')
    .gte('end_date', today)
    .order('begining_date', { ascending: true });

  if (params.from) {
    query = query.gte("begining_date", params.from);
  }
  if (params.to) {
    query = query.lte("end_date", params.to);
  }
  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data: cursos, error } = await query;
  
  if (error) {
    console.error("Supabase query error in public/cursos:", error);
  }

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }));

  const currency = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cursosWithImages?.map((c, index) => (
        <Link
          key={c.id}
          href={`/public/cursos/${c.id}`}
          className="
            surface rounded-xl overflow-hidden 
            shadow-md hover:shadow-2xl 
            transition-all duration-300 
            hover:scale-[1.02] hover:-translate-y-1
            flex flex-col group
            border border-transparent hover:border-primary/20
          "
        >
          <div className="relative h-48 bg-muted flex items-center justify-center text-tertiary overflow-hidden">
            {c.imageUrl ? (
              <>
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={75}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <span className="text-sm">Sin imagen disponible</span>
            )}
            <Badge className="absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg bg-success text-success-foreground">
              {c.state}
            </Badge>
          </div>

          <div className="p-6 flex flex-col flex-1 justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {c.name}
              </h2>
              <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-2">
                {c.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground-secondary text-sm">
                  <DollarSign className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-wide">Precio</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {currency.format(c.price || 0)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs">
                  {c.begining_date} - {c.end_date}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all" aria-hidden="true">
                <span>Ver detalles</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        </Link>
      ))}

      {!cursosWithImages?.length && <EmptyCoursesState clearHref="/public/cursos" />}
    </div>
  );
}

export default async function PublicCursosPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const clearHref = '/public/cursos';

  return (
    <div className="container-padding section-spacing">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Cursos Disponibles</h1>
          <p className="text-foreground-secondary">
            Explora nuestra oferta educativa y encuentra el curso perfecto para ti
          </p>
        </div>
      </div>

      <form
        className="flex flex-wrap gap-3 mb-8"
        action={clearHref}
        aria-label="Filtrar cursos"
      >
        <label htmlFor="cursos-search" className="sr-only">Buscar curso por nombre</label>
        <input
          id="cursos-search"
          type="text"
          name="search"
          placeholder="Buscar por nombre..."
          defaultValue={params.search}
          className="input-base flex-1 min-w-[200px]"
        />
        <label htmlFor="cursos-from" className="sr-only">Fecha de inicio desde</label>
        <input
          id="cursos-from"
          type="date"
          name="from"
          defaultValue={params.from}
          className="input-base"
        />
        <label htmlFor="cursos-to" className="sr-only">Fecha de fin hasta</label>
        <input
          id="cursos-to"
          type="date"
          name="to"
          defaultValue={params.to}
          className="input-base"
        />
        <Button type="submit">
          Filtrar
        </Button>
        <Button asChild variant="outline">
          <Link href={clearHref}>Limpiar</Link>
        </Button>
      </form>

      <Suspense fallback={<CourseGridSkeleton />}>
        <CursosList params={params} />
      </Suspense>
    </div>
  );
}
