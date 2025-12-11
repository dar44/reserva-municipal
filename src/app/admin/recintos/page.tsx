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
      <div className="flex justify-between items-center mb-8">
        <h1>Recintos</h1>
        <Button asChild>
          <Link href="/admin/recintos/nuevo">+ Nuevo Recinto</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recintos?.map(r => {
              const imageUrl = getRecintoImageUrl(supabase, r.image, r.image_bucket, defaultImageUrl)
              const isDisponible = r.state === 'Disponible'
              return (
                <TableRow key={r.id}>
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
                  <TableCell className="text-right">
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