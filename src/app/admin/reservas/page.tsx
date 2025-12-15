import Link from 'next/link'
import DeleteReservaButton from './DeleteReservaButton'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

type SearchParams = {
  search?: string
  status?: string
}

type Reserva = {
  id: number
  user_uid: string
  start_at: string
  end_at: string
  price: number
  status: string
  paid: boolean
  users: { name: string; surname: string } | null
  recintos: { name: string } | null
}

type Inscripcion = {
  id: number
  user_uid: string
  status: string
  paid: boolean
  price: number
  users: { name: string; surname: string } | null
  cursos: {
    name: string
    begining_date: string
    end_date: string
    price: number
    start_time: string | null
    end_time: string | null
    days_of_week: number[] | null
  } | null
}

type UnifiedItem = {
  id: string
  originalId: number
  tipo: 'Recinto' | 'Curso'
  usuario: string
  item: string
  fechaInicio: string
  horaInicio: string | null
  horario: string
  total: number
  estado: string
  paid?: boolean
}

export default async function AdminReservasPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, status } = await searchParams
  const supabase = supabaseAdmin

  // Fetch reservas de recintos
  const { data: reservasData } = await supabase
    .from('reservas')
    .select('id,user_uid,start_at,end_at,price,status,paid,users(name,surname),recintos(name)')
    .order('start_at', { ascending: false }) as { data: Reserva[] | null }

  // Fetch inscripciones a cursos
  const { data: inscripcionesData } = await supabase
    .from('inscripciones')
    .select(
      'id,user_uid,status,paid,users!inscripciones_user_uid_fkey(name,surname),cursos(name,begining_date,end_date,price,start_time,end_time,days_of_week)'
    ) as { data: Inscripcion[] | null }

  const safeInscripciones = inscripcionesData ?? []

  // Unify data
  const unifiedItems: UnifiedItem[] = []

  if (reservasData) {
    reservasData.forEach((r) => {
      const startDate = new Date(r.start_at)
      const endDate = new Date(r.end_at)
      const usuario = r.users ? `${r.users.name} ${r.users.surname}` : 'Desconocido'
      const estadoReserva =
        (r.status?.toLowerCase() || '') === 'cancelada'
          ? 'Cancelada'
          : r.paid
            ? 'Confirmada'
            : 'Pendiente'

      unifiedItems.push({
        id: `recinto-${r.id}`,
        originalId: r.id,
        tipo: 'Recinto',
        usuario,
        item: r.recintos?.name || 'Recinto desconocido',
        fechaInicio: startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        horaInicio: startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        horario: `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}-${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        total: Number(r.price),
        estado: estadoReserva,
        paid: r.paid
      })
    })
  }

  if (safeInscripciones.length > 0) {
    safeInscripciones.forEach((i) => {
      const usuario = i.users ? `${i.users.name} ${i.users.surname}` : 'Desconocido'
      const beginDate = i.cursos?.begining_date ? new Date(i.cursos.begining_date) : null
      const estadoInscripcion =
        (i.status?.toLowerCase() || '') === 'cancelada'
          ? 'Cancelada'
          : i.paid
            ? 'Confirmada'
            : 'Pendiente'

      let horario = '-'
      const startTime = i.cursos?.start_time
      const endTime = i.cursos?.end_time
      const daysOfWeek = i.cursos?.days_of_week

      if (startTime && endTime && daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
        const dayLabels = daysOfWeek.map(d => dayNames[d - 1]).filter(Boolean).join(', ')
        horario = `${dayLabels} ${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`
      }

      unifiedItems.push({
        id: `curso-${i.id}`,
        originalId: i.id,
        tipo: 'Curso',
        usuario,
        item: i.cursos?.name || 'Curso desconocido',
        fechaInicio: beginDate ? beginDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
        horaInicio: null,
        horario,
        total: Number(i.cursos?.price || 0),
        estado: estadoInscripcion,
        paid: i.paid
      })
    })
  }

  // Filter by search
  let filteredItems = unifiedItems
  if (search) {
    const searchLower = search.toLowerCase()
    filteredItems = filteredItems.filter(
      (item) =>
        item.usuario.toLowerCase().includes(searchLower) ||
        item.item.toLowerCase().includes(searchLower)
    )
  }

  // Filter by status
  if (status && status !== 'all') {
    filteredItems = filteredItems.filter((item) => {
      const itemStatus = item.estado.toLowerCase()
      const filterStatus = status.toLowerCase()
      return itemStatus === filterStatus
    })
  }

  // Sort by fecha
  filteredItems.sort((a, b) => {
    const dateA = new Date(a.fechaInicio.split('/').reverse().join('-'))
    const dateB = new Date(b.fechaInicio.split('/').reverse().join('-'))
    return dateB.getTime() - dateA.getTime()
  })

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmada':
        return 'bg-success text-success-foreground'
      case 'pendiente':
        return 'bg-warning text-warning-foreground'
      case 'cancelada':
        return 'bg-muted text-muted-foreground'
      default:
        return ''
    }
  }

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Reservas e Inscripciones</h1>
          <p className="text-foreground-secondary">
            Consulta y gestiona todas las reservas de recintos e inscripciones a cursos
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por usuario o ítem..."
            className="input-base flex-1"
          />
          <select
            name="status"
            defaultValue={status ?? 'all'}
            className="input-base sm:w-64"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmada">Confirmada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <Button type="submit" className="sm:w-auto">
            Filtrar
          </Button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ítem</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{item.usuario}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-secondary">{item.item}</TableCell>
                  <TableCell className="text-secondary">
                    <div className="flex flex-col">
                      <span>{item.fechaInicio}</span>
                      {item.horaInicio && (
                        <span className="text-xs text-tertiary">{item.horaInicio}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary">{item.horario}</TableCell>
                  <TableCell className="font-medium">$ {item.total}</TableCell>
                  <TableCell>
                    <Badge className={getEstadoBadgeClass(item.estado)}>
                      {item.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={
                            item.tipo === 'Recinto'
                              ? `/admin/reservas/${item.originalId}/editar`
                              : `/admin/inscripciones/${item.originalId}/editar`
                          }
                        >
                          Editar
                        </Link>
                      </Button>
                      <DeleteReservaButton id={item.originalId} tipo={item.tipo} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-secondary py-8">
                  No se encontraron reservas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}