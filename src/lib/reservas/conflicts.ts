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
  courseStatuses = ['aprobada'],
}: ConflictOptions): Promise<ConflictResult> {
  let courseConflict = false
  let citizenConflict = false

  if (includeCourseReservations) {
    let courseQuery = supabase
      .from('curso_reservas')
      .select('id')
      .eq('recinto_id', recintoId)
      .lt('start_at', endAt)
      .gt('end_at', startAt)

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

  if (includeCitizenReservations) {
    let citizenQuery = supabase
      .from('reservas')
      .select('id')
      .eq('recinto_id', recintoId)
      .lt('start_at', endAt)
      .gt('end_at', startAt)

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