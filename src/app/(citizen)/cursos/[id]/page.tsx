import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InscripcionActions from './InscripcionActions'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { getPublicStorageUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function CursoDetail ({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: curso } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single()
  if (!curso) return notFound()

  const imageUrl = getPublicStorageUrl(supabase, curso.image, curso.image_bucket)

  const { count } = await supabase
    .from('inscripciones')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', id)
    .eq('status', 'activa')

  const { data: { user } } = await supabase.auth.getUser()
  let inscripcionId: number | null = null
  if (user) {
    const { data } = await supabase
      .from('inscripciones')
      .select('id')
      .eq('curso_id', id)
      .eq('user_uid', user.id)
      .eq('status', 'activa')
      .maybeSingle()
    inscripcionId = data?.id ?? null
  }

  const disponibles = (curso.capacity || 0) - (count || 0)
  const currency = getConfiguredCurrency()
  const priceNumber = Number(curso.price ?? 0)
  const priceLabel = priceNumber > 0 ? formatCurrency(priceNumber, currency) : 'Gratis'

  return (
    <div className="space-y-6">
      <Link href="/cursos" className="text-sm underline">← Volver</Link>
      <div className="grid md:grid-cols-2 gap-8 bg-gray-800 rounded-lg p-6 shadow">
        <div className="relative h-64 bg-gray-700 flex items-center justify-center text-gray-400">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={curso.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          ) : (
            <span className="text-sm">Sin imagen disponible</span>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{curso.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs ${curso.state === 'Disponible' ? 'bg-green-700' : 'bg-red-700'}`}>{curso.state}</span>
          </div>
          <p><strong>Fecha inicio:</strong> {curso.begining_date ? new Date(curso.begining_date).toLocaleDateString() : ''}</p>
          <p><strong>Fecha fin:</strong> {curso.end_date ? new Date(curso.end_date).toLocaleDateString() : ''}</p>
          <p><strong>Ubicación:</strong> {curso.location}</p>
          <p><strong>Descripción:</strong> {curso.description}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-sm">Plazas totales</p>
              <p className="text-lg font-bold">{curso.capacity}</p>
            </div>
            <div>
              <p className="text-sm">Plazas disponibles</p>
              <p className="text-lg font-bold">{disponibles}</p>
            </div>
          </div>
          <p><strong>Precio:</strong> {priceLabel}</p>
          <InscripcionActions cursoId={curso.id} email={user?.email} inscripcionId={inscripcionId} />
          <p className="text-xs text-gray-400">
            Te enviaremos al checkout de Lemon Squeezy para realizar el pago y confirmar la inscripción.
          </p>
        
        </div>
      </div>
    </div>
  )
}