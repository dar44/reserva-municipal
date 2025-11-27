import { NextResponse } from 'next/server'
import { AuthorizationError, assertRole, isRole } from '@/lib/auth/roles'
import type { CourseReservation } from '@/lib/models/cursos'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hasRecintoConflicts } from '@/lib/reservas/conflicts'
import { requireAuthAPI } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

type UpdateFields = Partial<Pick<CourseReservation, 'start_at' | 'end_at' | 'observations' | 'status'>>

function parseReservationId (params: { id: string }): number {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    throw new AuthorizationError('Identificador inválido', 400)
  }
  return id
}

function sanitizeUpdate (body: Record<string, unknown>): UpdateFields {
  const updates: UpdateFields = {}

  if (typeof body.start_at === 'string') {
    const start = new Date(body.start_at)
    if (Number.isNaN(start.getTime())) throw new AuthorizationError('start_at inválido', 400)
    updates.start_at = start.toISOString()
  }

  if (typeof body.end_at === 'string') {
    const end = new Date(body.end_at)
    if (Number.isNaN(end.getTime())) throw new AuthorizationError('end_at inválido', 400)
    updates.end_at = end.toISOString()
  }

  if ('observations' in body) {
    updates.observations = typeof body.observations === 'string' ? body.observations : null
  }

  if ('status' in body && typeof body.status === 'string') {
    const allowed: CourseReservation['status'][] = ['pendiente', 'cancelada']
    if (!allowed.includes(body.status as CourseReservation['status'])) {
      throw new AuthorizationError('Estado no permitido', 400)
    }
    updates.status = body.status as CourseReservation['status']
  }

  if (updates.start_at && updates.end_at) {
    const start = new Date(updates.start_at)
    const end = new Date(updates.end_at)
    if (end <= start) {
      throw new AuthorizationError('La hora de fin debe ser posterior a la de inicio', 400)
    }
  }

  return updates
}

export async function PATCH (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['admin', 'organizer'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth
  try {
    const { id: rawId } = await params
    const id = parseReservationId({ id: rawId })

    const updates = sanitizeUpdate(await req.json().catch(() => ({})))

    const { data: current, error } = await supabase
      .from('curso_reservas')
      .select('id, organizer_uid, status, recinto_id, start_at, end_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!current) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (isRole(profile, 'organizer')) {

      if (current.organizer_uid !== profile.uid) {
        return NextResponse.json({ error: 'No puedes modificar esta reserva' }, { status: 403 })
      }

      if (current.status !== 'pendiente' && updates.status !== 'cancelada') {
        return NextResponse.json({ error: 'Solo puedes cancelar reservas aprobadas/rechazadas' }, { status: 403 })
      }
    } else {
      assertRole(profile, ['admin'])
    }

    const startAt = updates.start_at ?? current.start_at
    const endAt = updates.end_at ?? current.end_at

    if (updates.start_at || updates.end_at) {
      const availability = await hasRecintoConflicts({
        supabase: supabaseAdmin,
        recintoId: current.recinto_id,
        startAt,
        endAt,
        ignoreCourseReservationId: id,
        courseStatuses: ['pendiente', 'aprobada'],
      })

      if (availability.error) {
        return NextResponse.json({ error: availability.error.message }, { status: 400 })
      }

      if (availability.conflict) {
        return NextResponse.json({ error: 'El recinto ya está reservado para ese horario' }, { status: 409 })
      }
    }

    const { data, error: updateError } = await supabase
      .from('curso_reservas')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ reserva: data as CourseReservation })
  } catch (error) {
    console.error('PATCH /api/organizer/reservas/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al actualizar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['admin', 'organizer'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth
  try {
    const { id: rawId } = await params
    const id = parseReservationId({ id: rawId })

    const filter = isRole(profile, 'organizer')
      ? { id, organizer_uid: profile.uid, status: 'pendiente' }
      : { id }

    if (!isRole(profile, 'organizer', 'admin')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { error } = await supabase
      .from('curso_reservas')
      .delete()
      .match(filter)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/organizer/reservas/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al eliminar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}