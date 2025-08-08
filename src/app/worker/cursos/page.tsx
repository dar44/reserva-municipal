import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function WorkerCursosPage() {
  const supabase = await createSupabaseServer();
  const { data: cursos } = await supabase
    .from("cursos")
    .select("id,name,state")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cursos Disponibles</h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos?.map(c => (
            <tr key={c.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-0.5 rounded text-xs ${c.state === 'Disponible' ? 'bg-green-700' : 'bg-gray-600'}`}>{c.state}</span>
              </td>
              <td className="px-4 py-2">
                <Link href={`/worker/cursos/${c.id}/inscripcion`} className="bg-green-600 px-2 py-1 rounded text-xs">Inscribir</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}