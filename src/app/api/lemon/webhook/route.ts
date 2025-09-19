// app/api/lemon/webhook/route.ts
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/** Opcional, ponlo a true solo en staging si quieres probar sin firma */
const SKIP_SIG = process.env.LEMON_WEBHOOK_SKIP_SIGNATURE === 'true'

/** Verifica HMAC SHA-256 con el secret configurado en Lemon */
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
      status?: string                     // 'paid' | 'refunded' | 'cancelled' | 'failed' | ...
      order_id?: string | number
      order_identifier?: string | number
      identifier?: string | number
      currency?: string                   // p. ej. 'CLP', 'EUR'
      total?: number                      // total en minor units
      checkout_data?: {
        custom?: Record<string, unknown>  // aquí llega pago_id
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

  // Solo tratamos eventos de pedidos. Otros (subscriptions, license_key...) se ignoran.
  const isOrderEvent = e.startsWith('order_') || ['paid','refunded','failed','cancelled','expired','pending'].includes(s)
  if (!isOrderEvent) return null

  if (e === 'order_created' || s === 'paid') return 'pagado'
  if (e === 'order_refunded' || s === 'refunded') return 'reembolsado'
  if (e === 'order_payment_failed' || s === 'failed') return 'fallido'
  if (e === 'order_expired' || e === 'order_cancelled' || s === 'expired' || s === 'cancelled') return 'cancelado'
  // Si no tenemos info clara, no fuerces 'pendiente' sobre un pago existente:
  if (s === 'pending' || e === 'order_pending') return 'pendiente'
  return null
}

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // 1) Firma
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') || req.headers.get('X-Signature')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''
  if (!SKIP_SIG && !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  // 2) Parse + extracción segura
  let payload: LemonWebhook
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const headerEvent = req.headers.get('x-event-name') ?? undefined
  const eventName = headerEvent ?? payload.meta?.event_name ?? payload.event_name
  const attributes = payload.data?.attributes ?? {}

  // 🔴 Aquí está tu pago_id
  const custom = (attributes.checkout_data?.custom ?? {}) as Record<string, unknown>
  const pagoIdRaw = custom.pago_id ?? custom.pagoId
  const pagoId =
    typeof pagoIdRaw === 'string' ? pagoIdRaw :
    typeof pagoIdRaw === 'number' ? String(pagoIdRaw) : ''

  if (!pagoId) {
    // No podemos mapear el pago → 400 para que revises createCheckout (debe mandar pago_id)
    return NextResponse.json({ error: 'missing_pago_id' }, { status: 400 })
  }

  // OrderId robusto
  const orderIdentifier =
    attributes.order_id ?? attributes.order_identifier ?? attributes.identifier ?? payload.data?.id ?? null

  // Estado solo si el evento/estado es relevante
  const estado = mapEstado(eventName, attributes.status)
  if (estado === null) {
    // No es un evento de pedido: ignoramos (200) para no reintentar inútilmente.
    return NextResponse.json({ ok: true, ignored: true })
  }

  // 3) Actualiza 'pagos'
  const updateFields: Record<string, unknown> = {
    estado,
    payload_raw: payload
  }
  if (orderIdentifier != null) updateFields.order_id = String(orderIdentifier)
  if (typeof attributes.total === 'number') updateFields.monto_centavos = attributes.total
  if (attributes.currency) updateFields.moneda = attributes.currency

  const { data: pago, error: pagoErr } = await supabaseAdmin
    .from('pagos')
    .update(updateFields)
    .eq('id', pagoId)
    .select('id,reserva_id,inscripcion_id')
    .maybeSingle()

  if (pagoErr || !pago) {
    return NextResponse.json({ error: pagoErr?.message || 'pago_not_found' }, { status: 400 })
  }

  // No hace falta tocar reservas/inscripciones aquí:
  // tu trigger SQL ya pone paid=true cuando estado='pagado'
  // (apply_pago_estado AFTER INSERT/UPDATE OF estado)

  return NextResponse.json({ ok: true })
}