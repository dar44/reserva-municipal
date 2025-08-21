import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function AdminRecintosPage () {
  const supabase = await createSupabaseServer()
  const { data: recintos } = await supabase
    .from('recintos')
    .select('id,name,ubication,state')
    .order('name')

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recintos</h1>
        <Link href="/admin/recintos/nuevo" className="bg-blue-600 px-3 py-1 rounded text-sm">+ Nuevo Recinto</Link>
      </div>
      <table className="min-w-full bg-gray-800 rounded overflow-hidden text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Ubicación</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recintos?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.ubication}</td>
              <td className="px-4 py-2">{r.state}</td>
              <td className="px-4 py-2">
                <Link href={`/admin/recintos/${r.id}`} className="text-blue-400">Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}