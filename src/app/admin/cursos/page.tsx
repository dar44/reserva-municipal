import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabaseServer'
import CursoActions from './CursoActions'
import { getPublicStorageUrl } from '@/lib/storage'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function AdminCursosPage() {
  const supabase = await createSupabaseServer()
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select('id,image,image_bucket,name,description,begining_date,state')
    .order('name')

  if (error) {
    console.error('LIST cursos error:', error)
  }

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  return (
    <div className="container-padding section-spacing">
      <div className="flex justify-between items-center mb-8">
        <h1>Cursos</h1>
        <Button asChild>
          <Link href="/admin/cursos/nuevo">+ Nuevo Curso</Link>
        </Button>
      </div>

      {!cursosWithImages?.length && (
        <p className="text-secondary">No hay cursos.</p>
      )}

      {!!cursosWithImages?.length && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursosWithImages.map(c => {
                const isDisponible = c.state === 'Disponible'
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={c.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-secondary">{c.description}</TableCell>
                    <TableCell className="text-secondary">
                      {c.begining_date ? new Date(c.begining_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isDisponible ? "default" : "secondary"}
                        className={isDisponible ? "bg-success text-success-foreground" : ""}
                      >
                        {c.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CursoActions id={c.id} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}