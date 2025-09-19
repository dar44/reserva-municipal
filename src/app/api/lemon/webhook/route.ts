// app/api/lemon/webhook/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { mapEstado, updateRelated } from '../utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // asegura Node runtime p/ crypto/Buffer

// ⚠️ Solo para pruebas locales/staging (NO prod)
const SKIP_SIG = process.env.LEMON_WEBHOOK_SKIP_SIGNATURE === 'true'

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBody, 'utf8')
    const digest = hmac.digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest, 'hex'))
  } catch {
    return false
  }
}

type LemonWebhook = {
  meta?: { event_name?: string }
  event_name?: string
  data?: {
    id?: string
    attributes?: {
      status?: string
      order_id?: string | number
      order_identifier?: string | number
      identifier?: string | number
      currency?: string
      total?: number
      checkout_data?: {
        custom?: Record<string, unknown>
        email?: string
        name?: string
      }
    }
  }
}

export async function POST(req: Request) {
  // 1) Firma
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''
  if (!SKIP_SIG && !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  // 2) Parse
  let payload: LemonWebhook
  try { payload = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const headerEvent = req.headers.get('x-event-name') ?? undefined
  const eventName = headerEvent ?? payload.meta?.event_name ?? payload.event_name
  const attributes = payload.data?.attributes ?? {}

  // pago_id desde checkout_data.custom
  const custom = (attributes.checkout_data?.custom ?? {}) as Record<string, unknown>
  const pagoIdRaw = custom.pago_id ?? custom.pagoId
  const pagoId =
    typeof pagoIdRaw === 'string' ? pagoIdRaw :
    typeof pagoIdRaw === 'number' ? String(pagoIdRaw) : ''

  if (!pagoId) return NextResponse.json({ error: 'missing_pago_id' }, { status: 400 })

  const orderIdentifier =
    attributes.order_id ?? attributes.order_identifier ?? attributes.identifier ?? payload.data?.id ?? null

  const estado = mapEstado(eventName, attributes.status)
  if (estado === null) return NextResponse.json({ ok: true, ignored: true })

  // 3) Actualiza pagos
  const updateFields: Record<string, unknown> = { estado, payload_raw: payload }
  if (orderIdentifier != null) updateFields.order_id = String(orderIdentifier)
  if (typeof attributes.total === 'number') updateFields.monto_centavos = attributes.total
  if (attributes.currency) updateFields.moneda = attributes.currency

  const { data: pago, error: pagoErr } = await supabaseAdmin
    .from('pagos')
    .update(updateFields)
    .eq('id', pagoId)
    .select('id,reserva_id,inscripcion_id')
    .maybeSingle()

  if (pagoErr || !pago) return NextResponse.json({ error: pagoErr?.message || 'pago_not_found' }, { status: 400 })

  // 4) Fuerza actualización en tablas hijas (además de tu trigger)
  try {
    if (pago.reserva_id) await updateRelated('reservas', pago.reserva_id as number, estado)
    if (pago.inscripcion_id) await updateRelated('inscripciones', pago.inscripcion_id as number, estado)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'related_update_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
