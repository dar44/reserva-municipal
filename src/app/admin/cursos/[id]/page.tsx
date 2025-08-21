import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  const supabase = await createSupabaseServer()
  const { data: curso, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) console.error('FETCH curso error:', error)
  if (!curso) return notFound()

  const eliminarCurso = async () => {
    'use server'
    const supabase = await createSupabaseServer()
    const { error } = await supabase.from('cursos').delete().eq('id', id)
    if (error) {
      console.error('DELETE cursos error:', error)
      throw new Error(error.message)
    }
    redirect('/admin/cursos')
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link href="/admin/cursos" className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Detalles del Curso</h1>

      {curso.image && (
        <img src={curso.image} alt={curso.name} className="w-full h-64 object-cover rounded" />
      )}

      <div className="space-y-1 text-sm">
        <p><strong>Nombre:</strong> {curso.name}</p>
        <p><strong>Descripción:</strong> {curso.description}</p>
        <p><strong>Ubicación:</strong> {curso.location}</p>
        <p><strong>Fecha Inicio:</strong> {curso.begining_date ? new Date(curso.begining_date).toLocaleDateString() : ''}</p>
        <p><strong>Fecha Fin:</strong> {curso.end_date ? new Date(curso.end_date).toLocaleDateString() : ''}</p>
        <p><strong>Precio:</strong> {curso.price}</p>
        <p><strong>Estado:</strong> {curso.state}</p>
        <p><strong>Capacidad:</strong> {curso.capacity}</p>
      </div>

      <div className="space-x-3">
        <Link href={`/admin/cursos/${id}/editar`} className="text-yellow-400">Editar</Link>
        <form action={eliminarCurso} className="inline">
          <button className="text-red-400" type="submit">Eliminar</button>
        </form>
      </div>
    </div>
  )
}
