import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import InscripcionForm from './InscripcionForm'
import { ArrowLeft } from 'lucide-react'

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
      {/* Back link - Ley de Fitts: target grande */}
      <Link
        href="/worker/cursos"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header con gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Inscripción en {curso.name}</h1>
          <p className="text-foreground-secondary">
            Completa los datos del ciudadano para realizar la inscripción
          </p>
        </div>
      </div>

      <div className="surface p-6 rounded-xl border border-border shadow-md">
        <InscripcionForm cursoId={curso.id} />
      </div>
    </div>
  )
}