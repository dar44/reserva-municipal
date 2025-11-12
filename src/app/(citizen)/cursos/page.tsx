import { createServerClient } from '@supabase/ssr'
import Image from 'next/image'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getPublicStorageUrl } from '@/lib/storage'

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
};

export default async function CursosPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        }
      }
    }
  );

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Cursos Disponibles</h1>

      <form
        className="flex gap-2 mb-6 items-end"
        action="/cursos"
      >
        <input
          type="date"
          name="from"
          defaultValue={params.from}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 rounded text-sm hover:bg-blue-500"
        >
          Filtrar
        </button>
        <Link
          href="/cursos"
          className="px-3 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600"
        >
          Limpiar
        </Link>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosWithImages?.map(c => (
          <Link
            key={c.id}
            href={`/cursos/${c.id}`}
            className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
          >
            <div className="relative h-40 bg-gray-700 flex items-center justify-center text-gray-400">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <span className="text-sm">Sin imagen disponible</span>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {c.description}
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-400 flex justify-between items-center">
                <span>{currency.format(c.price || 0)}</span>
                <span>
                  {c.begining_date} - {c.end_date}
                </span>
              </div>
              <button className="mt-3 w-full border border-blue-600 text-blue-400 rounded py-1 text-sm">
                Ver más
              </button>
            </div>
          </Link>
        ))}
        {!cursosWithImages?.length && (
          <p className="text-sm text-gray-400">No se han encontrado cursos disponibles con los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
}