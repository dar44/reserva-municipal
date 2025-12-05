import Link from 'next/link'
import DeleteReservaButton from './DeleteReservaButton'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
  users: any
  cursos: any
  id: number
  user_uid: string
  status: string
  paid: boolean
  price: number
}

type UnifiedItem = {
  id: string // `${tipo}-${id}`
  originalId: number
  tipo: 'Recinto' | 'Curso'
  usuario: string
  usuarioDNI: string
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
    .order('start_at', { ascending: false })
    .returns<Reserva[]>()

  // Fetch inscripciones a cursos
  const { data: inscripcionesData } = await supabase
    .from('inscripciones')
    .select(
      'id,user_uid,status,paid,users!inscripciones_user_uid_fkey(name,surname),cursos(name,begining_date,end_date,price,start_time,end_time,days_of_week)'
    )
    .returns<Inscripcion[]>()

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
        usuarioDNI: startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
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
      const endDate = i.cursos?.end_date ? new Date(i.cursos.end_date) : null
      const estadoInscripcion =
        (i.status?.toLowerCase() || '') === 'cancelada'
          ? 'Cancelada'
          : i.paid
            ? 'Confirmada'
            : 'Pendiente'

      // Construir el horario basado en los campos start_time, end_time y days_of_week
      let horario = '-'

      const startTime = i.cursos?.start_time
      const endTime = i.cursos?.end_time
      const daysOfWeek = i.cursos?.days_of_week

      if (startTime && endTime && daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        const dayLabels = daysOfWeek.map(d => dayNames[d - 1]).filter(Boolean)

        const daysText = dayLabels.length === 1
          ? dayLabels[0]
          : dayLabels.length === 2
            ? `${dayLabels[0]} y ${dayLabels[1]}`
            : dayLabels.slice(0, -1).join(', ') + ' y ' + dayLabels[dayLabels.length - 1]

        horario = `${daysText} ${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`
      } else if (beginDate && endDate) {
        // Fallback: mostrar rango de fechas si no hay horarios
        const formatDate = (date: Date) =>
          date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        horario = `${formatDate(beginDate)} - ${formatDate(endDate)}`
      }

      unifiedItems.push({
        id: `curso-${i.id}`,
        originalId: i.id,
        tipo: 'Curso',
        usuario,
        usuarioDNI: beginDate ? beginDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
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

  // Filter by search (usuario or item)
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

  // Sort by fecha inicio descending
  filteredItems.sort((a, b) => {
    const dateA = new Date(a.fechaInicio.split('/').reverse().join('-'))
    const dateB = new Date(b.fechaInicio.split('/').reverse().join('-'))
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reservas</h1>

      {/* Filters */}
      <form method="get" className="flex gap-3 items-center">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar por usuario o ítem..."
          className="flex-1 max-w-md bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? 'all'}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="confirmada">Confirmada</option>
          <option value="pendiente">Pendiente</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700">
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="bg-gray-800 rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Ítem</th>
              <th className="px-4 py-3 text-left">Fecha y hora</th>
              <th className="px-4 py-3 text-left">Horario</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.usuario}</span>
                      <span className="text-xs text-gray-400">{item.usuarioDNI}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      {item.tipo === 'Curso' ? '📚' : '🏢'} {item.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.item}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{item.fechaInicio}</span>
                      {item.horaInicio && (
                        <span className="text-xs text-gray-400">{item.horaInicio}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.horario}</td>
                  <td className="px-4 py-3">$ {item.total}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${item.estado.toLowerCase() === 'confirmada'
                        ? 'bg-green-900 text-green-300'
                        : item.estado.toLowerCase() === 'pendiente'
                          ? 'bg-yellow-900 text-yellow-300'
                          : item.estado.toLowerCase() === 'cancelada'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={
                          item.tipo === 'Recinto'
                            ? `/admin/reservas/${item.originalId}/editar`
                            : `/admin/inscripciones/${item.originalId}/editar`
                        }
                        className="text-blue-400 hover:text-blue-300"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <DeleteReservaButton id={item.originalId} tipo={item.tipo} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}