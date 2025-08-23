import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

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
    .from("cursos")
    .select(
      "id,name,description,price,begining_date,end_date,image,state"
    )
    .eq("state", "Disponible")
    .order("begining_date", { ascending: true });

  if (params.from) {
    query = query.gte("begining_date", params.from);
  }
  if (params.to) {
    query = query.lte("end_date", params.to);
  }

  const { data: cursos } = await query;

  const currency = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
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
        {cursos?.map(c => (
          <Link
            key={c.id}
            href={`/cursos/${c.id}`}
            className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
          >
            <div className="h-40 bg-gray-700 flex items-center justify-center text-gray-400">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                "Imagen"
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
      </div>
    </div>
  );
}