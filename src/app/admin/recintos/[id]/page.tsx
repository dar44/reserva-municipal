import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from '@/lib/recintoImages'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function RecintoDetailPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  const supabase = await createSupabaseServer()
  const { data: recinto } = await supabase
    .from('recintos')
    .select('id,name,description,ubication,province,postal_code,state,image,image_bucket')
    .eq('id', id)
    .single()

  if (!recinto) redirect('/admin/recintos')

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase)
  const imageUrl = getRecintoImageUrl(supabase, recinto.image, recinto.image_bucket, defaultImageUrl)
  const isDisponible = recinto.state === 'Disponible'

  return (
    <div className="container-padding section-spacing max-w-4xl mx-auto">
      <Breadcrumbs
        homeHref="/admin/panel"
        items={[
          { label: 'Recintos', href: '/admin/recintos' },
          { label: recinto.name }
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Detalle del Recinto</h1>
          <Badge
            variant={isDisponible ? "default" : "secondary"}
            className={isDisponible ? "bg-success text-success-foreground" : ""}
          >
            {recinto.state}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-80 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={recinto.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          ) : (
            <span className="text-tertiary">Sin imagen</span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">{recinto.name}</h2>
            <div className="space-y-3 text-secondary">
              <p><strong className="text-foreground">Descripción:</strong> {recinto.description}</p>
              <p><strong className="text-foreground">Ubicación:</strong> {recinto.ubication}</p>
              <p><strong className="text-foreground">Provincia:</strong> {recinto.province}</p>
              <p><strong className="text-foreground">Código Postal:</strong> {recinto.postal_code}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href={`/admin/recintos/${id}/editar`}>Editar Recinto</Link>
            </Button>
            <DeleteButton id={id} />
          </div>
        </div>
      </div>
    </div>
  )
}