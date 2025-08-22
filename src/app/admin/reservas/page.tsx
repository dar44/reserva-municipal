import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

interface SearchParams {
  user?: string
  recinto?: string
  from?: string
  to?: string
}

export default async function AdminReservasPage ({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createSupabaseServer()

  const { user, recinto, from, to } = await searchParams

  let query = supabase
    .from('reservas')
    .select('id,start_at,status, users(name), recintos(name)')
    .order('start_at', { ascending: false })

  if (user) query = query.eq('user_uid', user)
  if (recinto) query = query.eq('recinto_id', recinto)
  if (from) query = query.gte('start_at', new Date(from).toISOString())
  if (to) query = query.lte('start_at', new Date(to).toISOString())

  const { data: reservas } = await query
  const { data: usuarios } = await supabase.from('users').select('uid,name').order('name')
  const { data: recintos } = await supabase.from('recintos').select('id,name').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>
      <form className="flex flex-wrap gap-2 mb-4">
        <select
          name="user"
          defaultValue={user ?? ''}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          <option value="">Usuario</option>
          {usuarios?.map(u => (
            <option key={u.uid} value={u.uid}>{u.name}</option>
          ))}
        </select>
        <select
          name="recinto"
          defaultValue={recinto ?? ''}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          <option value="">Recinto</option>
          {recintos?.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from ?? ''}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={to ?? ''}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        />
        <button type="submit" className="bg-blue-600 px-3 py-1 rounded text-sm">Filtrar</button>
      </form>
      <table className="min-w-full bg-gray-800 rounded overflow-hidden text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Usuario</th>
            <th className="px-4 py-2 text-left">Recinto</th>
            <th className="px-4 py-2 text-left">Fecha y hora</th>
            <th className="px-4 py-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
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