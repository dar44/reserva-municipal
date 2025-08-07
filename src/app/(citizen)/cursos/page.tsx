import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
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

  const { data: cursos } = await supabase
    .from("cursos")
    .select("id,name,title,description,schedule,image")
    .order("name");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cursos Disponibles</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos?.map(c => (
          <Link key={c.id} href={`/cursos/${c.id}`} className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            <div className="h-40 bg-gray-700 flex items-center justify-center text-gray-400">
              {c.image ? <img src={c.image} alt={c.name || c.title} className="object-cover w-full h-full" /> : "Imagen"}
            </div>
            <div className="p-4 space-y-1">
              <h2 className="text-lg font-semibold">{c.name || c.title}</h2>
              <p className="text-sm text-gray-300 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-500">{c.schedule}</p>
              <button className="mt-2 w-full border border-blue-600 text-blue-400 rounded py-1 text-sm">Ver más</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}