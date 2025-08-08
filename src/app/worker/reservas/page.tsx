import { createSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function WorkerReservasPage() {
  const supabase = await createSupabaseServer();
  const { data: reservas } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,users(name),recintos(name)")
    .order("start_at", { ascending: true });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listado de Reservas</h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Usuario</th>
            <th className="px-4 py-2 text-left">Recinto</th>
            <th className="px-4 py-2 text-left">Fecha y Hora</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{r.id}</td>
              <td className="px-4 py-2">{Array.isArray(r.users) ? r.users.map((u: { name: string }, i: number) => <span key={i}>{u.name}{i < r.users.length - 1 ? ', ' : ''}</span>) : null}</td>
              <td className="px-4 py-2">{Array.isArray(r.recintos) ? r.recintos.map((rec: { name: string }, i: number) => <span key={i}>{rec.name}{i < r.recintos.length - 1 ? ', ' : ''}</span>) : null}</td>
              <td className="px-4 py-2">{formatDate(r.start_at)} - {formatDate(r.end_at)}</td>
              <td className="px-4 py-2">
                <button className="bg-red-600 px-2 py-1 rounded text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}