import { NextResponse } from 'next/server'
import { AuthorizationError, isRole } from '@/lib/auth/roles'
import type { CourseReservation, ReservationDecisionInput } from '@/lib/models/cursos'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hasRecintoConflicts } from '@/lib/reservas/conflicts'
import { requireAuthAPI } from '@/lib/auth/guard'
import { sendSolicitudAprobadaEmailDirect, sendSolicitudRechazadaEmailDirect } from '@/lib/emailNotifications'

export const dynamic = 'force-dynamic'

function parseReservationId(params: { id: string }): number {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    throw new AuthorizationError('Identificador inválido', 400)
  }
  return id
}

function sanitizeDecision(body: Partial<ReservationDecisionInput>): ReservationDecisionInput {
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

export async function PATCH(
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
      .select('id, status, recinto_id, start_at, end_at, organizer_uid, observations, recintos(name), users!curso_reservas_organizer_uid_fkey(email, name, surname)')
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

    // Enviar email de notificación al organizador usando datos ya disponibles
    try {
      if (decision.status === 'aprobada' || decision.status === 'rechazada') {
        // Extraer datos del organizador y recinto del SELECT inicial
        const organizerRaw: any = (current as any)?.users
        const organizerEmail: string | null = organizerRaw && !Array.isArray(organizerRaw)
          ? organizerRaw.email ?? null
          : Array.isArray(organizerRaw) ? organizerRaw[0]?.email ?? null : null
        const organizerName: string | null = organizerRaw && !Array.isArray(organizerRaw)
          ? organizerRaw.name ?? null
          : Array.isArray(organizerRaw) ? organizerRaw[0]?.name ?? null : null
        const organizerSurname: string | null = organizerRaw && !Array.isArray(organizerRaw)
          ? organizerRaw.surname ?? null
          : Array.isArray(organizerRaw) ? organizerRaw[0]?.surname ?? null : null
        const recintoRaw: any = (current as any)?.recintos
        const recintoName: string = (recintoRaw && !Array.isArray(recintoRaw) && recintoRaw.name)
          ? recintoRaw.name
          : (Array.isArray(recintoRaw) ? recintoRaw[0]?.name : null) ?? 'Recinto solicitado'

        if (organizerEmail) {
          const emailOpts = {
            organizerEmail,
            organizerName,
            organizerSurname,
            recintoName,
            startAt: current.start_at,
            endAt: current.end_at,
            observations: (current as any).observations ?? null,
          }
          if (decision.status === 'aprobada') {
            await sendSolicitudAprobadaEmailDirect(emailOpts)
          } else {
            await sendSolicitudRechazadaEmailDirect(emailOpts)
          }
        } else {
          console.warn('[EMAIL] No se encontró email del organizador en la respuesta; el email no se enviará')
        }
      }
    } catch (emailError) {
      console.error('Error sending organizer notification email:', emailError)
      // No fallar la actualización si el email falla
    }

    return NextResponse.json({ reserva: data as CourseReservation })
  } catch (error) {
    console.error('PATCH /api/worker/reservas/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al actualizar la reserva'
    return NextResponse.json({ error: message }, { status })
  }
}