import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { AuthorizationError, assertRole, getSessionProfile, isRole } from '@/lib/auth/roles'
import type { CourseReservation, CourseReservationRequestInput } from '@/lib/models/cursos'

export const dynamic = 'force-dynamic'

interface ReservationFilters {
  status?: string
  curso_id?: number
}

type ReservationBlock = { start_at: string; end_at: string }

type SanitizedReservationPayload = {
  curso_id: number
  recinto_id: number
  organizer_uid?: string
  observations: string | null
  blocks: ReservationBlock[]
}

function parseTime (value: string | undefined, label: string) {
  if (!value) throw new AuthorizationError(`${label} es obligatorio`, 400)
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) {
    throw new AuthorizationError(`${label} inválido`, 400)
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new AuthorizationError(`${label} inválido`, 400)
  }
  return { hours, minutes }
}

function combineDateAndTime (date: Date, time: { hours: number; minutes: number }) {
  const result = new Date(date)
  result.setHours(time.hours, time.minutes, 0, 0)
  return result
}

function sanitizeReservationPayload (body: Partial<CourseReservationRequestInput>): SanitizedReservationPayload {
  if (body.curso_id === undefined) throw new AuthorizationError('curso_id es obligatorio', 400)
  if (body.recinto_id === undefined) throw new AuthorizationError('recinto_id es obligatorio', 400)

  const startDateRaw = body.start_date
  const endDateRaw = body.end_date
  if (!startDateRaw) throw new AuthorizationError('start_date es obligatorio', 400)
  if (!endDateRaw) throw new AuthorizationError('end_date es obligatorio', 400)

  const startDate = new Date(`${startDateRaw}T00:00:00`)
  const endDate = new Date(`${endDateRaw}T00:00:00`)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AuthorizationError('Fechas inválidas', 400)
  }

  if (endDate < startDate) {
    throw new AuthorizationError('La fecha final debe ser posterior o igual a la inicial', 400)
  }

  const startTime = parseTime(body.start_time, 'start_time')
  const endTime = parseTime(body.end_time, 'end_time')

  const startMinutes = startTime.hours * 60 + startTime.minutes
  const endMinutes = endTime.hours * 60 + endTime.minutes

  if (endMinutes <= startMinutes) {
    throw new AuthorizationError('La hora de fin debe ser posterior a la de inicio', 400)
  }

  const rawDays = Array.isArray(body.days_of_week)
    ? body.days_of_week
    : body.days_of_week !== undefined
      ? [body.days_of_week]
      : []

  const uniqueDays = new Set<number>()
  for (const rawDay of rawDays) {
    const day = Number(rawDay)
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new AuthorizationError('days_of_week debe contener valores entre 0 y 6', 400)
    }
    uniqueDays.add(day)
  }

  if (uniqueDays.size === 0) {
    throw new AuthorizationError('Debes seleccionar al menos un día de la semana', 400)
  }

  const blocks: ReservationBlock[] = []
  for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
    const day = current.getDay()
    if (!uniqueDays.has(day)) continue

    const currentDate = new Date(current)
    const startAt = combineDateAndTime(currentDate, startTime)
    const endAt = combineDateAndTime(currentDate, endTime)

    blocks.push({
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    })
  }

  if (blocks.length === 0) {
    throw new AuthorizationError('No se generaron bloques de reserva con los parámetros indicados', 400)
  }

  const observations = typeof body.observations === 'string'
    ? body.observations.trim() || null
    : null

  return {
    curso_id: Number(body.curso_id),
    recinto_id: Number(body.recinto_id),
    organizer_uid: body.organizer_uid,
    observations,
    blocks,
  }
}

function parseFilters (url: URL): ReservationFilters {
  const status = url.searchParams.get('status') || undefined
  const cursoIdParam = url.searchParams.get('curso_id')
  const curso_id = cursoIdParam ? Number(cursoIdParam) : undefined
  return { status, curso_id }
}

export async function GET (req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const profile = await getSessionProfile(supabase)

    if (!isRole(profile, 'organizer', 'admin', 'worker')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const filters = parseFilters(new URL(req.url))

    let query = supabase
      .from('curso_reservas')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.curso_id) {
      query = query.eq('curso_id', filters.curso_id)
    }

    if (isRole(profile, 'organizer')) {
      query = query.eq('organizer_uid', profile.uid)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reservas: data as CourseReservation[] })
  } catch (error) {
    console.error('GET /api/organizer/reservas', error)
    const status = error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: 'Error al consultar las reservas' }, { status })
  }
}

export async function POST (req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const profile = await getSessionProfile(supabase)
    assertRole(profile, ['organizer', 'admin'])

    const payload = await req.json().catch(() => ({}))
    const sanitized = sanitizeReservationPayload(payload)

    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('id, organizer_uid')
      .eq('id', sanitized.curso_id)
      .maybeSingle()

    if (cursoError) {
      return NextResponse.json({ error: cursoError.message }, { status: 400 })
    }

    if (!curso) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    if (isRole(profile, 'organizer') && curso.organizer_uid !== profile.uid) {
      return NextResponse.json({ error: 'No puedes reservar para un curso ajeno' }, { status: 403 })
    }

    const organizerUid = isRole(profile, 'organizer')
      ? profile.uid
      : sanitized.organizer_uid ?? curso.organizer_uid

    const firstBlockStart = sanitized.blocks[0].start_at
    const lastBlockEnd = sanitized.blocks[sanitized.blocks.length - 1].end_at

    const { data: conflicts, error: conflictsError } = await supabase
      .from('curso_reservas')
      .select('id,start_at,end_at')
      .eq('recinto_id', sanitized.recinto_id)
      .in('status', ['pendiente', 'aprobada'])
      .lt('start_at', lastBlockEnd)
      .gt('end_at', firstBlockStart)

    if (conflictsError) {
      return NextResponse.json({ error: conflictsError.message }, { status: 400 })
    }

    const hasConflict = (conflicts ?? []).some(conflict =>
      sanitized.blocks.some(block =>
        new Date(conflict.start_at).getTime() < new Date(block.end_at).getTime() &&
        new Date(conflict.end_at).getTime() > new Date(block.start_at).getTime(),
      ),
    )

    if (hasConflict) {
      return NextResponse.json({ error: 'El recinto ya está reservado para uno de los horarios seleccionados' }, { status: 409 })
    }

    const entries = sanitized.blocks.map(block => ({
      curso_id: sanitized.curso_id,
      organizer_uid: organizerUid,
      recinto_id: sanitized.recinto_id,
      start_at: block.start_at,
      end_at: block.end_at,
      observations: sanitized.observations,
    }))

    const { data, error } = await supabase
      .from('curso_reservas')
      .insert(entries)
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const sorted = (data ?? []).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

    return NextResponse.json({ reservas: sorted as CourseReservation[] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/organizer/reservas', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al solicitar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}