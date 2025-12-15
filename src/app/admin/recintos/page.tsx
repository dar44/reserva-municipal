import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabaseServer'
import RecintoActions from './RecintoActions'
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from '@/lib/recintoImages'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function AdminRecintosPage() {
  const supabase = await createSupabaseServer()
  const { data: recintos } = await supabase
    .from('recintos')
    .select('id,name,ubication,state,image,image_bucket')
    .order('name')

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase)

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="mb-2">Recintos</h1>
              <p className="text-foreground-secondary">
                Gestiona los espacios deportivos disponibles para actividades y eventos
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/recintos/nuevo">+ Nuevo Recinto</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recintos?.map(r => {
              const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl)
              const isDisponible = r.state === 'Disponible'
              return (
                <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={r.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-secondary">{r.ubication}</TableCell>
                  <TableCell>
                    <Badge
                      variant={isDisponible ? "default" : "secondary"}
                      className={isDisponible ? "bg-success text-success-foreground" : ""}
                    >
                      {r.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <RecintoActions id={r.id} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}