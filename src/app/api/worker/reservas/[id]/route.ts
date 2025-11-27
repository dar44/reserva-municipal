import { NextResponse } from 'next/server'
import { AuthorizationError, isRole } from '@/lib/auth/roles'
import type { CourseReservation, ReservationDecisionInput } from '@/lib/models/cursos'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hasRecintoConflicts } from '@/lib/reservas/conflicts'
import { requireAuthAPI } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

function parseReservationId (params: { id: string }): number {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    throw new AuthorizationError('Identificador inválido', 400)
  }
  return id
}

function sanitizeDecision (body: Partial<ReservationDecisionInput>): ReservationDecisionInput {
  if (!body.status) {
    throw new AuthorizationError('El estado es obligatorio', 400)
  }

  const status = body.status
  if (!['aprobada', 'rechazada', 'cancelada'].includes(status)) {
    throw new AuthorizationError('Estado no permitido', 400)
  }

  return {
    status: status as ReservationDecisionInput['status'],
    observations: body.observations ?? null,
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['worker', 'admin'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {
    const { id: rawId } = await params
    const id = parseReservationId({ id: rawId })
    const decision = sanitizeDecision(await req.json().catch(() => ({})))

    const { data: current, error: currentError } = await supabase
      .from('curso_reservas')
      .select('id, status, recinto_id, start_at, end_at')
      .eq('id', id)
      .maybeSingle()

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 400 })
    }

    if (!current) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (current.status !== 'pendiente' && !isRole(profile, 'admin')) {
      return NextResponse.json({ error: 'Solo reservas pendientes pueden ser validadas' }, { status: 409 })
    }

    if (decision.status === 'aprobada') {
      const availability = await hasRecintoConflicts({
        supabase: supabaseAdmin,
        recintoId: current.recinto_id,
        startAt: current.start_at,
        endAt: current.end_at,
        ignoreCourseReservationId: id,
        courseStatuses: ['aprobada'],
      })

      if (availability.error) {
        return NextResponse.json({ error: availability.error.message }, { status: 400 })
      }

      if (availability.conflict) {
        return NextResponse.json({ error: 'El recinto ya está reservado para ese horario' }, { status: 409 })
      }
    }

    const { data, error } = await supabase
      .from('curso_reservas')
      .update({
        status: decision.status,
        observations: decision.observations,
        worker_uid: profile.uid,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reserva: data as CourseReservation })
  } catch (error) {
    console.error('PATCH /api/worker/reservas/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al actualizar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}