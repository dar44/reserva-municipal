import PendingRequestsTable from './PendingRequestsTable'
import HistoryTable from './HistoryTable'
import { createSupabaseServer } from '@/lib/supabaseServer'
import StatCard from '@/components/StatCard'

export const dynamic = 'force-dynamic'

interface CourseReservationRecord {
  id: number
  curso_id: number
  recinto_id: number
  organizer_uid: string
  start_at: string
  end_at: string
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
  request_reason: string | null
  observations: string | null
  reviewed_at: string | null
  worker_uid: string | null
  created_at: string
}

export default async function WorkerSolicitudesPage() {
  const supabase = await createSupabaseServer()

  // Obtener todas las reservas de cursos
  const { data: courseReservations, error: courseReservationsError } = await supabase
    .from('curso_reservas')
    .select('id,curso_id,recinto_id,organizer_uid,start_at,end_at,status,request_reason,observations,reviewed_at,worker_uid,created_at')
    .order('created_at', { ascending: false })
    .returns<CourseReservationRecord[]>()

  if (courseReservationsError) {
    console.error('Error fetching course reservations', courseReservationsError)
  }

  const reservations = courseReservations ?? []

  // Obtener IDs únicos para consulta por lotes
  const recintoIds = Array.from(new Set(reservations.map(r => r.recinto_id)))
  const organizerUids = Array.from(new Set(reservations.map(r => r.organizer_uid)))

  type NameRecord = { id: number; name: string }
  type UserRecord = { uid: string; name: string }

  let recintoNameMap = new Map<number, string>()
  let organizerNameMap = new Map<string, string>()

  // Obtener nombres de recintos
  if (recintoIds.length > 0) {
    const recintoNamesResult = await supabase
      .from('recintos')
      .select('id,name')
      .in('id', recintoIds)
      .returns<NameRecord[]>()

    recintoNameMap = new Map((recintoNamesResult.data ?? []).map(record => [record.id, record.name]))

    if (recintoNamesResult.error) {
      console.error('Error fetching recinto names for requests', recintoNamesResult.error)
    }
  }

  // Obtener nombres de organizadores desde la tabla users
  if (organizerUids.length > 0) {
    const organizerNamesResult = await supabase
      .from('users')
      .select('uid,name')
      .in('uid', organizerUids)
      .returns<UserRecord[]>()

    organizerNameMap = new Map((organizerNamesResult.data ?? []).map(record => [record.uid, record.name]))

    if (organizerNamesResult.error) {
      console.error('Error fetching organizer names', organizerNamesResult.error)
    }
  }

  // Dividir en pendientes e historial
  const pendingRequests = reservations
    .filter(r => r.status === 'pendiente')
    .map(r => ({
      id: r.id,
      organizer_name: organizerNameMap.get(r.organizer_uid) ?? 'Organizador desconocido',
      created_at: r.created_at,
      recinto_name: recintoNameMap.get(r.recinto_id) ?? `Recinto #${r.recinto_id}`,
      start_at: r.start_at,
      end_at: r.end_at,
      status: r.status as 'pendiente',
      observations: r.request_reason,
    }))

  const historyRequests = reservations
    .filter(r => r.status === 'aprobada' || r.status === 'rechazada')
    .map(r => ({
      id: r.id,
      organizer_name: organizerNameMap.get(r.organizer_uid) ?? 'Organizador desconocido',
      created_at: r.created_at,
      recinto_name: recintoNameMap.get(r.recinto_id) ?? `Recinto #${r.recinto_id}`,
      start_at: r.start_at,
      end_at: r.end_at,
      status: r.status as 'aprobada' | 'rechazada',
      request_reason: r.request_reason,
      observations: r.observations,
    }))

  // Calcular estadísticas
  const totalRequests = reservations.length
  const pendingCount = reservations.filter(r => r.status === 'pendiente').length
  const approvedCount = reservations.filter(r => r.status === 'aprobada').length

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Solicitudes de recintos</h1>
        <p className="text-sm text-gray-400">
          Revisa y gestiona las solicitudes de uso de recintos por organizadores
        </p>
      </section>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total de solicitudes" value={totalRequests} />
        <StatCard label="Pendientes de revisión" value={pendingCount} className="border-yellow-600" />
        <StatCard label="Aprobadas" value={approvedCount} className="border-green-600" />
      </div>

      {/* Pending Requests */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Solicitudes pendientes</h2>
        <PendingRequestsTable requests={pendingRequests} />
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Historial de solicitudes</h2>
        <HistoryTable history={historyRequests} />
      </section>
    </div>
  )
}