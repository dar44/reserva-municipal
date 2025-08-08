import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function AdminReservasPage () {
  const supabase = await createSupabaseServer()
  const { data: reservas } = await supabase
    .from('reservas')
    .select('id,start_at,status, users(name), recintos(name)')
    .order('start_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>
      <table className="min-w-full bg-gray-800 rounded overflow-hidden text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">ID reserva</th>
            <th className="px-4 py-2 text-left">Usuario</th>
            <th className="px-4 py-2 text-left">Recinto</th>
            <th className="px-4 py-2 text-left">Fecha y hora</th>
            <th className="px-4 py-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{r.id}</td>
              <td className="px-4 py-2">{r.users?.[0]?.name}</td>
              <td className="px-4 py-2">{r.recintos?.[0]?.name}</td>
              <td className="px-4 py-2">{new Date(r.start_at).toLocaleString()}</td>
              <td className="px-4 py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}