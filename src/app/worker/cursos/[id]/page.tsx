import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import CancelButton from './CancelButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, ArrowLeft, UserX } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export const dynamic = 'force-dynamic'

type Inscripcion = {
  id: number
  paid: boolean
  usuario: {
    dni: string | null
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  const supabase = await createSupabaseServer()

  const { data: curso } = await supabase
    .from('cursos')
    .select('name')
    .eq('id', id)
    .single()

  if (!curso) return notFound()

  const { data: inscripciones, error } = await supabase
    .from('inscripciones')
    .select(`
      id,
      paid,
      usuario:users!inscripciones_user_uid_fkey (
        dni,
        name,
        email,
        phone
      )
    `)
    .eq('curso_id', id)
    .eq('status', 'activa')
    .returns<Inscripcion[]>()

  if (error) {
    console.error('[WORKER/cursos/[id]] INSCRIPCIONES error:', error)
  }

  return (
    <div className="container-padding section-spacing">
      {/* Back link con mejor estilo - Ley de Fitts */}
      <Link
        href="/worker/cursos"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cursos
      </Link>

      {/* Header con gradient - consistencia visual */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Usuarios Inscritos en {curso.name}</h1>
          <p className="text-foreground-secondary">
            Gestiona las inscripciones activas y consulta el estado de pago
          </p>
        </div>
      </div>

      {inscripciones && inscripciones.length > 0 ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>DNI</span>
                  </div>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscripciones.map((i) => (
                <TableRow key={i.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-secondary">{i.usuario?.dni ?? '—'}</TableCell>
                  <TableCell className="font-medium">{i.usuario?.name ?? '—'}</TableCell>
                  <TableCell className="text-secondary">{i.usuario?.email ?? '—'}</TableCell>
                  <TableCell className="text-secondary">{i.usuario?.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={i.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                      {i.paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <CancelButton id={i.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={<UserX className="w-16 h-16 text-primary/40" />}
          title="No hay inscripciones activas"
          description="Este curso todavía no tiene usuarios inscritos. Las inscripciones aparecerán aquí automáticamente"
          action={{
            label: "Inscribir ciudadano",
            href: `/worker/cursos/${id}/inscripcion`
          }}
        />
      )}
    </div>
  )
}
