import type { AppRole } from '@/lib/auth/roles'

export type CursoState = 'Disponible' | 'No disponible' | 'Cancelado'

export interface Curso {
  id: number
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  days_of_week: number[] | null
  price: number
  state: CursoState
  capacity: number
  image: string | null
  organizer_uid: string
  created_at: string
  updated_at: string
}

export type CourseReservationStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'

export interface CourseReservation {
  id: number
  curso_id: number
  organizer_uid: string
  recinto_id: number
  start_at: string
  end_at: string
  status: CourseReservationStatus
  request_reason: string | null
  worker_uid: string | null
  reviewed_at: string | null
  observations: string | null
  created_at: string
  updated_at: string
}

export interface CourseInput {
  name: string
  description?: string | null
  location?: string | null
  begining_date?: string | null
  end_date?: string | null
  start_time?: string | null
  end_time?: string | null
  days_of_week?: number[] | null
  price?: number
  capacity?: number
  image?: string | null
  state?: CursoState
  organizer_uid?: string
}

export interface CourseReservationRequestInput {
  curso_id: number
  recinto_id: number
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  days_of_week: number[]
  observations?: string | null
  organizer_uid?: string
}

export interface ReservationDecisionInput {
  status: Extract<CourseReservationStatus, 'aprobada' | 'rechazada' | 'cancelada'>
  observations?: string | null
}

export interface ProfileSummary {
  uid: string
  role: AppRole
}