import { createSupabaseServer } from "@/lib/supabaseServer";
import Image from 'next/image'
import CursoActions from "./CursoActions";
import { getPublicStorageUrl } from '@/lib/storage'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyCoursesState } from "@/components/ui/empty-state"
import { Tooltip } from "@/components/ui/tooltip"
import { History, Users } from "lucide-react"

export const dynamic = "force-dynamic";

interface Curso {
  id: number
  image: string | null
  image_bucket: string | null
  name: string
  description: string | null
  begining_date: string | null
  end_date: string | null
  capacity: number | null
  state: string
  inscripciones: { count: number }[]
}

type CursoWithImage = Curso & { imageUrl: string | null }

function CursosTable({ cursos, showActions }: { cursos: CursoWithImage[]; showActions: boolean }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Plazas</span>
              </div>
            </TableHead>
            <TableHead>Estado</TableHead>
            {showActions && <TableHead className="text-center">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cursos.map(c => {
            const ocupadas = c.inscripciones?.[0]?.count ?? 0;
            const isDisponible = !showActions ? false : c.state === "Disponible";
            return (
              <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
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
                  {c.begining_date ? new Date(c.begining_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-secondary">
                  {c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-secondary">
                  <span className={ocupadas >= (c.capacity ?? 0) ? "text-error font-medium" : ""}>
                    {(c.capacity ?? 0) - ocupadas}/{c.capacity ?? 0}
                  </span>
                </TableCell>
                <TableCell>
                  {showActions ? (
                    <Tooltip content={isDisponible ? "Curso abierto para inscripciones" : "Curso no disponible para nuevas inscripciones"}>
                      <Badge
                        variant={isDisponible ? "default" : "secondary"}
                        className={isDisponible ? "bg-success text-success-foreground cursor-help" : "cursor-help"}
                      >
                        {c.state}
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Badge variant="secondary">No disponible</Badge>
                  )}
                </TableCell>
                {showActions && (
                  <TableCell className="text-center">
                    <CursoActions id={c.id} state={c.state} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function WorkerCursosPage() {
  const supabase = await createSupabaseServer()
  const { data: cursos } = await supabase
    .from("cursos")
    .select(
      "id,image,image_bucket,name,description,begining_date,end_date,capacity,state,inscripciones(count)"
    )
    .eq("inscripciones.status", "activa")
    .order("name")
    .returns<Curso[]>()

  const cursosWithImages: CursoWithImage[] = (cursos ?? []).map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = cursosWithImages.filter(c => !c.end_date || new Date(c.end_date) >= today);
  const past = cursosWithImages.filter(c => c.end_date && new Date(c.end_date) < today);

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient - Ley de Jakob: consistencia visual */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Gestión de Cursos</h1>
          <p className="text-foreground-secondary">
            Consulta inscripciones y gestiona el estado de los cursos disponibles
          </p>
        </div>
      </div>

      {cursosWithImages.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <>
          {active.length > 0 ? (
            <CursosTable cursos={active} showActions={true} />
          ) : (
            <p className="text-secondary text-sm mb-6">No hay cursos activos en este momento.</p>
          )}

          {past.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Historial de Cursos</h2>
              </div>
              <p className="text-secondary text-sm mb-4">Cursos cuya fecha de fin ya ha pasado.</p>
              <div className="opacity-75">
                <CursosTable cursos={past} showActions={false} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
