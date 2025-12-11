import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import CancelButton from './CancelButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
      <Link href="/worker/cursos" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver
      </Link>

      <h1 className="mb-8">
        Usuarios Inscritos en el Curso: {curso.name}
      </h1>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscripciones?.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="text-secondary">{i.usuario?.dni ?? '—'}</TableCell>
                <TableCell className="font-medium">{i.usuario?.name ?? '—'}</TableCell>
                <TableCell className="text-secondary">{i.usuario?.email ?? '—'}</TableCell>
                <TableCell className="text-secondary">{i.usuario?.phone ?? '—'}</TableCell>
                <TableCell>
                  <Badge className={i.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                    {i.paid ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <CancelButton id={i.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!inscripciones || inscripciones.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-secondary py-8">
                  No hay inscripciones activas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
