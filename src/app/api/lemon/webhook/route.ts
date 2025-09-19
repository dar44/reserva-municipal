// app/api/lemon/webhook/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

type Estado = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'cancelado'

function mapEstado(eventName?: string, status?: string): Estado | null {
  const e = (eventName ?? '').toLowerCase()
  const s = (status ?? '').toLowerCase()

  const isOrderEvent =
    e.startsWith('order_') ||
    ['paid', 'refunded', 'failed', 'cancelled', 'expired', 'pending', 'completed', 'success', 'succeeded'].includes(s)
  if (!isOrderEvent) return null

  const paidEvents = new Set([
    'order_created',
    'order_paid',
    'order_payment_success',
    'order_payment_succeeded',
    'order_completed',
    'order_success'
  ])

  if (paidEvents.has(e) || ['paid','completed','success','succeeded'].includes(s)) return 'pagado'
  if (e === 'order_refunded' || s === 'refunded') return 'reembolsado'
  if (e === 'order_payment_failed' || s === 'failed') return 'fallido'
  if (e === 'order_expired' || e === 'order_cancelled' || s === 'expired' || s === 'cancelled') return 'cancelado'
  if (s === 'pending' || e === 'order_pending') return 'pendiente'
  return null
}

// 🔧 helper para actualizar tablas hijas poniendo paid/estado
async function updateRelated(table: 'reservas' | 'inscripciones', id: number, estado: Estado) {
  const setPaid = { paid: estado === 'pagado' }
  const setFull: Record<string, any> = { ...setPaid, estado }

  // 1º intentamos con paid + estado
  let res = await supabaseAdmin.from(table).update(setFull).eq('id', id).select('id').single()

  // Si la tabla no tiene columna "estado", reintenta solo con "paid"
  if (res.error && (res.error.code === '42703' || /column .*estado.* does not exist/i.test(res.error.message))) {
    res = await supabaseAdmin.from(table).update(setPaid).eq('id', id).select('id').single()
  }

  if (res.error) throw new Error(`${table}_update_failed: ${res.error.message}`)
  return res.data
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
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'related_update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
