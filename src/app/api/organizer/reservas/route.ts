import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { AuthorizationError, assertRole, getSessionProfile, isRole } from '@/lib/auth/roles'
import type { CourseReservation, CourseReservationInput } from '@/lib/models/cursos'

export const dynamic = 'force-dynamic'

interface ReservationFilters {
  status?: string
  curso_id?: number
}

function sanitizeReservationPayload (body: Partial<CourseReservationInput>): CourseReservationInput {
  if (body.curso_id === undefined) throw new AuthorizationError('curso_id es obligatorio', 400)
  if (body.recinto_id === undefined) throw new AuthorizationError('recinto_id es obligatorio', 400)
  if (!body.start_at) throw new AuthorizationError('start_at es obligatorio', 400)
  if (!body.end_at) throw new AuthorizationError('end_at es obligatorio', 400)

  const startDate = new Date(body.start_at)
  const endDate = new Date(body.end_at)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AuthorizationError('Fechas inválidas', 400)
  }

  if (endDate <= startDate) {
    throw new AuthorizationError('La hora de fin debe ser posterior a la de inicio', 400)
  }

  return {
    curso_id: Number(body.curso_id),
    recinto_id: Number(body.recinto_id),
    start_at: startDate.toISOString(),
    end_at: endDate.toISOString(),
    observations: body.observations ?? null,
    organizer_uid: body.organizer_uid,
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

    const { data: conflicts } = await supabase
      .from('curso_reservas')
      .select('id')
      .eq('recinto_id', sanitized.recinto_id)
      .in('status', ['pendiente', 'aprobada'])
      .lt('start_at', sanitized.end_at)
      .gt('end_at', sanitized.start_at)
      .limit(1)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'El recinto ya está reservado para ese horario' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('curso_reservas')
      .insert({
        curso_id: sanitized.curso_id,
        organizer_uid: organizerUid,
        recinto_id: sanitized.recinto_id,
        start_at: sanitized.start_at,
        end_at: sanitized.end_at,
        observations: sanitized.observations,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reserva: data as CourseReservation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/organizer/reservas', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al solicitar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}