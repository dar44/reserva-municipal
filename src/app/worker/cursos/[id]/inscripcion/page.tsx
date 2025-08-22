import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import InscripcionForm from './InscripcionForm'

export const dynamic = 'force-dynamic'

export default async function InscripcionCurso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: curso } = await supabase
    .from('cursos')
    .select('id,name')
    .eq('id', id)
    .single()

  if (!curso) return notFound()

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Link href="/worker/cursos" className="text-sm underline">← Volver al listado</Link>
      <h1 className="text-2xl font-bold">Inscripción en {curso.name}</h1>
      <div className="bg-gray-800 p-4 rounded space-y-3">
        <InscripcionForm cursoId={curso.id} />
      </div>
    </div>
  )
}