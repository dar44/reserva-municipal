import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { notifyPagoSiPagadoOnce } from '@/lib/emailNotifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  // Autenticación simple por cabecera compartida
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_EMAIL_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: { pagoId?: string, reservaId?: number | null, inscripcionId?: number | null }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const pagoId = payload.pagoId
  if (!pagoId) {
    return NextResponse.json({ error: 'missing_pagoId' }, { status: 400 })
  }

  // Leemos estado actual del pago (por si cambió a la vez)
  const { data: pago } = await supabaseAdmin
    .from('pagos')
    .select('id, estado, reserva_id, inscripcion_id')
    .eq('id', pagoId)
    .maybeSingle()

  if (!pago) {
    return NextResponse.json({ ok: false, reason: 'pago_not_found' }, { status: 404 })
  }

  const estado = (pago.estado ?? '').toLowerCase() as 'pagado' | 'pendiente' | 'fallido' | 'reembolsado' | 'cancelado'
  await notifyPagoSiPagadoOnce({
    pagoId: pago.id,
    estado,
    reservaId: pago.reserva_id ?? payload.reservaId ?? null,
    inscripcionId: pago.inscripcion_id ?? payload.inscripcionId ?? null,
  })

  return NextResponse.json({ ok: true })
}
