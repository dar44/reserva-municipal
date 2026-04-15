import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerReadOnly, createSupabaseServerAdmin } from '@/lib/supabaseServer'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { getPublicStorageUrl } from '@/lib/storage'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function PublicCursoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerAdmin()

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

  const disponibles = (curso.capacity || 0) - (count || 0)
  const currency = getConfiguredCurrency()
  const priceNumber = Number(curso.price ?? 0)
  const priceLabel = priceNumber > 0 ? formatCurrency(priceNumber, currency) : 'Gratis'
  const today = new Date().toISOString().split('T')[0]
  const hasEnded = curso.end_date ? curso.end_date < today : false
  const isDisponible = curso.state === 'Disponible' && !hasEnded

  return (
    <div className="container-padding section-spacing">
      <Breadcrumbs
        homeHref="/public/recintos"
        items={[
          { label: 'Cursos', href: '/public/cursos' },
          { label: curso.name }
        ]}
      />

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
            <div className="surface rounded-lg p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-lg font-semibold mb-2">¿Quieres inscribirte en este curso?</h3>
              <p className="text-sm text-foreground-secondary mb-4">
                Inicia sesión o regístrate para poder inscribirte y asegurar tu plaza.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/login?next=/cursos/${curso.id}`}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
