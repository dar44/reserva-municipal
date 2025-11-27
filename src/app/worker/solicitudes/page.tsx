import CourseReservationsTable from '../reservas/CourseReservationsTable'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

interface CourseReservationRecord {
  id: number
  curso_id: number
  recinto_id: number
  start_at: string
  end_at: string
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
  observations: string | null
  reviewed_at: string | null
  worker_uid: string | null
}

export default async function WorkerSolicitudesPage () {
  const supabase = await createSupabaseServer()

  const { data: courseReservations, error: courseReservationsError } = await supabase
    .from('curso_reservas')
    .select('id,curso_id,recinto_id,start_at,end_at,status,observations,reviewed_at,worker_uid')
    .order('created_at', { ascending: false })
    .returns<CourseReservationRecord[]>()

  if (courseReservationsError) {
    console.error('Error fetching course reservations', courseReservationsError)
  }

  const courseIds = Array.from(new Set((courseReservations ?? []).map(reservation => reservation.curso_id)))
  const recintoIds = Array.from(new Set((courseReservations ?? []).map(reservation => reservation.recinto_id)))

  type NameRecord = { id: number; name: string }

  let courseNameMap = new Map<number, string>()
  let recintoNameMap = new Map<number, string>()

  if (courseIds.length > 0) {
    const courseNamesResult = await supabase
      .from('cursos')
      .select('id,name')
      .in('id', courseIds)
      .returns<NameRecord[]>()

    courseNameMap = new Map((courseNamesResult.data ?? []).map(record => [record.id, record.name]))

    if (courseNamesResult.error) {
      console.error('Error fetching course names for requests', courseNamesResult.error)
    }
  }

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

  const reservationRows = (courseReservations ?? []).map(reservation => ({
    ...reservation,
    curso_name: courseNameMap.get(reservation.curso_id) ?? `Curso #${reservation.curso_id}`,
    recinto_name: recintoNameMap.get(reservation.recinto_id) ?? `Recinto #${reservation.recinto_id}`,
  }))

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Solicitudes de recintos</h1>
        <p className="text-sm text-gray-400">
          Gestiona todas las solicitudes enviadas por los organizadores y registra tus observaciones en cada decisión.
        </p>
      </section>

      <CourseReservationsTable reservations={reservationRows} />
    </div>
  )
}