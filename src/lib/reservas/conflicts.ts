import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { CourseReservationStatus } from '@/lib/models/cursos'

type ConflictOptions = {
  supabase: SupabaseClient
  recintoId: number
  startAt: string
  endAt: string
  ignoreCitizenReservationId?: number
  ignoreCourseReservationId?: number
  includeCitizenReservations?: boolean
  includeCourseReservations?: boolean
  citizenStatuses?: string[]
  courseStatuses?: CourseReservationStatus[]
}

interface ConflictResult {
  conflict: boolean
  error: PostgrestError | null
}

function applyOverlapFilter<
  Q extends {
    lt: (column: string, value: string) => Q
    gt: (column: string, value: string) => Q
  }
> (query: Q, startAt: string, endAt: string): Q {
  // Dos intervalos se solapan cuando el inicio de uno es anterior al final del otro
  // y su final es posterior al inicio del otro. Esto cubre los casos de solapamiento
  // parcial y total y evita que un bloqueo mueva automáticamente la reserva a la
  // siguiente hora libre.
  return query
    .lt('start_at', endAt)
    .gt('end_at', startAt)
}

export async function hasRecintoConflicts ({
  supabase,
  recintoId,
  startAt,
  endAt,
  ignoreCitizenReservationId,
  ignoreCourseReservationId,
  includeCitizenReservations = true,
  includeCourseReservations = true,
  citizenStatuses,
  courseStatuses = ['pendiente', 'aprobada'],
}: ConflictOptions): Promise<ConflictResult> {
  let courseConflict = false
  let citizenConflict = false

  if(includeCourseReservations) {
    let courseQuery = supabase
      .from('curso_reservas')
      .select('id')
      .eq('recinto_id', recintoId)
    courseQuery = applyOverlapFilter(courseQuery, startAt, endAt)

    if (ignoreCourseReservationId) {
      courseQuery = courseQuery.neq('id', ignoreCourseReservationId)
    }

    if (courseStatuses?.length) {
      courseQuery = courseQuery.in('status', courseStatuses)
    }

    const { data, error } = await courseQuery.limit(1)

    if (error) {
      return { conflict: false, error }
    }

    courseConflict = Boolean(data?.length)
  }

  if(includeCitizenReservations) {
    let citizenQuery = supabase
      .from('reservas')
      .select('id')
      .eq('recinto_id', recintoId)
    citizenQuery = applyOverlapFilter(citizenQuery, startAt, endAt)

    if (ignoreCitizenReservationId) {
      citizenQuery = citizenQuery.neq('id', ignoreCitizenReservationId)
    }

    if (citizenStatuses?.length) {
      citizenQuery = citizenQuery.in('status', citizenStatuses)
    } else {
      citizenQuery = citizenQuery.not('status', 'eq', 'cancelada')
    }

    const { data, error } = await citizenQuery.limit(1)

    if (error) {
      return { conflict: false, error }
    }

    citizenConflict = Boolean(data?.length)
  }

  return {
    conflict: courseConflict || citizenConflict,
    error: null,
  }
}