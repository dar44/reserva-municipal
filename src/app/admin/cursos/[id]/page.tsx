import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'
import { getPublicStorageUrl } from '@/lib/storage'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const imageUrl = getPublicStorageUrl(supabase, curso.image, curso.image_bucket)
  const currency = getConfiguredCurrency()
  const isDisponible = curso.state === 'Disponible'

  return (
    <div className="container-padding section-spacing max-w-4xl mx-auto">
      <Link href="/admin/cursos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver a Cursos
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Detalles del Curso</h1>
          <Badge
            variant={isDisponible ? "default" : "secondary"}
            className={isDisponible ? "bg-success text-success-foreground" : ""}
          >
            {curso.state}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={curso.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <span className="text-tertiary">Sin imagen disponible</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{curso.name}</h2>
            <div className="space-y-3 text-secondary">
              <p><strong className="text-foreground">Descripción:</strong> {curso.description}</p>
              <p><strong className="text-foreground">Ubicación:</strong> {curso.location}</p>
              <p><strong className="text-foreground">Fecha Inicio:</strong> {curso.begining_date ? new Date(curso.begining_date).toLocaleDateString() : '—'}</p>
              <p><strong className="text-foreground">Fecha Fin:</strong> {curso.end_date ? new Date(curso.end_date).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-secondary">Capacidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{curso.capacity}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-secondary">Precio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {curso.price ? formatCurrency(Number(curso.price), currency) : 'Gratis'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href={`/admin/cursos/${id}/editar`}>Editar Curso</Link>
            </Button>
            <DeleteButton id={id} />
          </div>
        </div>
      </div>
    </div>
  )
}