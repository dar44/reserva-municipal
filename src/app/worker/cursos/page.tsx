import { createSupabaseServer } from "@/lib/supabaseServer";
import Image from 'next/image'
import CursoActions from "./CursoActions";
import { getPublicStorageUrl } from '@/lib/storage'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic";

interface Curso {
  id: number
  image: string | null
  image_bucket: string | null
  name: string
  description: string | null
  begining_date: string | null
  capacity: number | null
  state: string
  inscripciones: { count: number }[]
}

export default async function WorkerCursosPage() {
  const supabase = await createSupabaseServer()
  const { data: cursos } = await supabase
    .from("cursos")
    .select(
      "id,image,image_bucket,name,description,begining_date,capacity,state,inscripciones(count)"
    )
    .eq("inscripciones.status", "activa")
    .order("name")
    .returns<Curso[]>()

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  return (
    <div className="container-padding section-spacing">
      <h1 className="mb-8">Gestión de Cursos</h1>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Plazas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cursosWithImages?.map(c => {
              const ocupadas = c.inscripciones?.[0]?.count ?? 0;
              const isDisponible = c.state === "Disponible"
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.imageUrl ? (
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-lg font-semibold text-muted-foreground">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-secondary">{c.description}</TableCell>
                  <TableCell className="text-secondary">
                    {c.begining_date
                      ? new Date(c.begining_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-secondary">
                    {(c.capacity ?? 0) - ocupadas}/{c.capacity ?? 0}
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
                    <CursoActions id={c.id} state={c.state} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}