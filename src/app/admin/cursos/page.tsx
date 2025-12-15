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
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="mb-2">Cursos</h1>
              <p className="text-foreground-secondary">
                Administra los cursos, su programación y estado de disponibilidad
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/cursos/nuevo">+ Nuevo Curso</Link>
            </Button>
          </div>
        </div>
      </div>

      {!cursosWithImages?.length && (
        <p className="text-secondary">No hay cursos.</p>
      )}

      {!!cursosWithImages?.length && (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursosWithImages.map(c => {
                const isDisponible = c.state === 'Disponible'
                return (
                  <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
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
                    <TableCell className="text-center">
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