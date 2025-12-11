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
    <div className="container-padding section-spacing max-w-2xl mx-auto">
      <Link href="/worker/cursos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver al listado
      </Link>

      <h1 className="mb-8">Inscripción en {curso.name}</h1>

      <div className="surface p-6 rounded-lg">
        <InscripcionForm cursoId={curso.id} />
      </div>
    </div>
  )
}