import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InscripcionActions from './InscripcionActions'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { getPublicStorageUrl } from '@/lib/storage'
import OpenStreetMapView from '@/components/OpenStreetMapView'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function CursoDetail({ params }: { params: Promise<{ id: string }> }) {
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
  const isDisponible = curso.state === 'Disponible'

  return (
    <div className="container-padding section-spacing">
      <Link href="/cursos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver
      </Link>

      <div className="grid md:grid-cols-2 gap-8 surface rounded-lg p-8 shadow-xl bg-gradient-to-br from-background to-surface">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-tertiary">
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

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{curso.name}</h1>
              <Badge
                variant={isDisponible ? "default" : "secondary"}
                className={isDisponible ? "bg-success text-success-foreground" : "bg-error text-error-foreground"}
              >
                {curso.state}
              </Badge>
            </div>

            <div className="space-y-3 text-secondary">
              <p><strong className="text-foreground">Descripción:</strong> {curso.description}</p>
              <p><strong className="text-foreground">Fecha inicio:</strong> {curso.begining_date ? new Date(curso.begining_date).toLocaleDateString() : '—'}</p>
              <p><strong className="text-foreground">Fecha fin:</strong> {curso.end_date ? new Date(curso.end_date).toLocaleDateString() : '—'}</p>
              <p><strong className="text-foreground">Ubicación:</strong> {curso.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-secondary">Plazas totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{curso.capacity}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-secondary">Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${disponibles > 0 ? 'text-success' : 'text-error'}`}>
                  {disponibles}
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-lg">
            <strong className="text-foreground">Precio:</strong>
            <span className="text-primary font-semibold ml-2">{priceLabel}</span>
          </p>

          <div className="pt-4 border-t border-border">
            <InscripcionActions cursoId={curso.id} email={user?.email} inscripcionId={inscripcionId} />
          </div>

          {inscripcionId && curso.location && (
            <OpenStreetMapView
              className="mt-4 rounded-lg overflow-hidden"
              address={curso.location}
              title="Cómo llegar al curso"
            />
          )}

          <p className="text-xs text-tertiary">
            Te enviaremos al checkout de Lemon Squeezy para realizar el pago y confirmar la inscripción.
          </p>
        </div>
      </div>
    </div>
  )
}