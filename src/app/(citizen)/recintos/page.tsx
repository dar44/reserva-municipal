import { createServerClient } from "@supabase/ssr";
import Image from "next/image";
import { cookies } from "next/headers";
import Link from "next/link";
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from "@/lib/recintoImages";

export const dynamic = "force-dynamic";

export default async function RecintosPage() {
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

  const { data: recintos } = await supabase
    .from("recintos")
    .select("id,name,description,ubication,state,image,image_bucket")
    .order("name");

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recintos Disponibles</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recintos?.map(r => {
          const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl);
          return (
            <Link
              key={r.id}
              href={`/recintos/${r.id}`}
              className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="relative h-40 bg-gray-700 flex items-center justify-center text-gray-400">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  "Imagen"
                )}
              </div>
              <div className="p-4 space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs ${r.state==='Disponible'?'bg-green-700':'bg-red-700'}`}>{r.state}</span>
                <h2 className="text-lg font-semibold">{r.name}</h2>
                <p className="text-sm text-gray-300 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-500">{r.ubication}</p>
                <button className="mt-2 w-full border border-blue-600 text-blue-400 rounded py-1 text-sm">Ver más</button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}