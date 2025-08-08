import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function WorkerRecintosPage() {
  const supabase = await createSupabaseServer();
  const { data: recintos } = await supabase
    .from("recintos")
    .select("id,name,ubication,state,image")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Recintos Deportivos</h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Ubicación</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recintos?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="h-10 w-10 object-cover rounded" />
                ) : (
                  <div className="h-10 w-10 bg-gray-700 rounded" />
                )}
              </td>
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.ubication}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${r.state === 'Disponible' ? 'bg-green-700' : 'bg-gray-600'}`}>{r.state}</span>
                  <div className="w-24 h-2 bg-gray-600 rounded">
                    <div className={`h-2 ${r.state === 'Disponible' ? 'bg-green-500 w-full' : 'bg-gray-400 w-full'}`}></div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 space-x-2">
                <Link href={`/worker/recintos/${r.id}/reservar`} className="bg-green-600 px-2 py-1 rounded text-xs">Reservar</Link>
                <button className="bg-red-600 px-2 py-1 rounded text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}