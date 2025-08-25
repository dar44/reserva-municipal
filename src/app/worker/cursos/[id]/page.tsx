import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import CancelButton from './CancelButton'

export const dynamic = 'force-dynamic'

type Inscripcion = {
  id: number
  usuario: {
    dni: string | null
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  const supabase = await createSupabaseServer()


  const { data: curso } = await supabase
    .from('cursos')
    .select('name')
    .eq('id', id)
    .single()

  if (!curso) return notFound()


  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select(`
      id,
      usuario:users!inscripciones_user_uid_fkey (
        dni,
        name,
        email,
        phone
      )
    `) 
    .eq('curso_id', id)
    .eq('status', 'activa')
    .returns<Inscripcion[]>()

  if (error) {
    console.error('[WORKER/cursos/[id]] INSCRIPCIONES error:', error)
  }

  return (
    <div>
      <Link href="/worker/cursos" className="text-sm underline">Volver</Link>
      <h1 className="text-2xl font-bold mb-4">
        Usuarios Inscritos en el Curso: {curso.name}
      </h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">DNI</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Teléfono</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones?.map((i) => (
            <tr key={i.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{i.usuario?.dni ?? '—'}</td>
              <td className="px-4 py-2">{i.usuario?.name ?? '—'}</td>
              <td className="px-4 py-2">{i.usuario?.email ?? '—'}</td>
              <td className="px-4 py-2">{i.usuario?.phone ?? '—'}</td>
              <td className="px-4 py-2">
                <CancelButton id={i.id} />
              </td>
            </tr>
          ))}
          {(!inscripciones || inscripciones.length === 0) && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                No hay inscripciones activas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
