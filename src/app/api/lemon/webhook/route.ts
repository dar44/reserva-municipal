import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyWebhookSignature } from '@/lib/lemonSqueezy' 
import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { notifyPagoConfirmado } from '@/lib/emailNotifications'
import { normalizePagoEstado, type PagoEstado } from '@/lib/pagos'

type FlexibleValue = string | number | boolean | null

type CustomData = {
  pago_id?: string
  reserva_id?: string | number
  inscripcion_id?: string | number
  checkout_id?: string | number
  [key: string]: FlexibleValue | undefined
}

type LemonAttributes = {
  status?: string | null
  total?: number | null
  currency?: string | null
  test_mode?: boolean | null
  [key: string]: FlexibleValue | null | undefined
}

type LemonWebhookData = {
  id?: string | number | null
  attributes?: LemonAttributes | null
  [key: string]: FlexibleValue | LemonAttributes | null | undefined
}

type LemonWebhookBody = {
  meta?: {
    event_name?: string
    webhook_id?: string
    custom_data?: CustomData
    [key: string]: FlexibleValue | CustomData | undefined
  }
  data?: LemonWebhookData | null
  [key: string]: FlexibleValue | LemonWebhookData | null | undefined
}

type WebhookEventRow = {
  id: string
}

type PagoRow = {
  id: string
  estado: string | null
  order_id: string | null
  monto_centavos?: number | null
  moneda?: string | null
  checkout_id?: string | null
  reserva_id?: number | null
  inscripcion_id?: number | null
  [key: string]: FlexibleValue | string | null | undefined
}

type PagoUpdate = {
  estado: string | null
  order_id?: string | null
  monto_centavos?: number | null
  moneda?: string | null
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


function mapOrderStatusToPagoEstado(s?: string | null): PagoEstado {
  if (!s) return 'pendiente'
  const v = s.toLowerCase()
  if (v === 'paid') return 'pagado'
  if (v === 'pending') return 'pendiente'
  if (v === 'failed') return 'fallido'
  if (v === 'refunded' || v === 'partially_refunded') return 'reembolsado'
  if (v === 'void' || v === 'canceled' || v === 'cancelled') return 'cancelado'
  return 'pendiente'
}

function estadoFromEventName(event: string): PagoEstado | null {
  const v = event.toLowerCase()
  if (v.includes('order_paid')) return 'pagado'
  if (v.includes('order_refunded') || v.includes('order_partially_refunded')) return 'reembolsado'
  if (v.includes('order_failed')) return 'fallido'
  if (v.includes('order_voided') || v.includes('order_canceled') || v.includes('order_cancelled')) return 'cancelado'
  return null
}

export async function POST(req: Request) {
  // 1) Firma (en dev puedes desactivar con LEMONSQUEEZY_DISABLE_SIGNATURE=true)
  const raw = await req.text()
  const signature = req.headers.get('x-signature') ?? req.headers.get('X-Signature')

  const disableSig = process.env.LEMONSQUEEZY_DISABLE_SIGNATURE === 'true'
  if (!disableSig) {
    const ok = verifyWebhookSignature(raw, signature)
    if (!ok) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  // 2) Parse
  let body: LemonWebhookBody
  try { body = JSON.parse(raw) as LemonWebhookBody } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const eventName: string = body?.meta?.event_name ?? ''
  const webhookId: string | undefined = body?.meta?.webhook_id
  const custom: CustomData = body?.meta?.custom_data ? { ...body.meta.custom_data } : {}
  const data: LemonWebhookData = body?.data ?? {}
  const attrs: LemonAttributes = data?.attributes ?? {}

  const orderId: string | null = data?.id ? String(data.id) : null
  const orderStatus: string | null = typeof attrs?.status === 'string' ? attrs.status : null
  const total: number | null = (typeof attrs?.total === 'number') ? attrs.total : null
  const currency: string | null = typeof attrs?.currency === 'string' ? attrs.currency : null

  // 3) Idempotencia: si ya procesamos este webhook_id, devolvemos 200
  if (webhookId) {
    const existingResponse = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('id', webhookId)
      .maybeSingle()
    const existing = existingResponse as PostgrestSingleResponse<WebhookEventRow>
    if (existing.data && existing.data.id) {
      return NextResponse.json({ ok: true, duplicate: true })
    }
  }

  // 4) Determinar estado final
  //    - prioridad: nombre de evento → 'pagado' si order_paid
  //    - si no, mapear por status de la order
  const estado: PagoEstado =
    estadoFromEventName(eventName) ?? mapOrderStatusToPagoEstado(orderStatus)

  
  // 5) Localizar el pago
  const pagoIdMeta: string | undefined = custom?.pago_id
  const reservaIdMeta: number | null = typeof custom.reserva_id !== 'undefined'
    ? Number(custom.reserva_id)
    : null
  const inscripcionIdMeta: number | null = typeof custom.inscripcion_id !== 'undefined'
    ? Number(custom.inscripcion_id)
    : null

  // Preferimos buscar por pago_id de metadata (es lo más fiable)
  let pago: PagoRow | null = null
  if (pagoIdMeta) {
    const pagoResponse = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('id', pagoIdMeta)
      .maybeSingle()
    const row = pagoResponse.data as PagoRow | null
    if (row) pago = row
  }
  // Fallback por order_id
  if (!pago && orderId) {
    const orderResponse = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('order_id', String(orderId))
      .maybeSingle()
    const row = orderResponse.data as PagoRow | null
    if (row) pago = row
  }
  // Fallback por checkout_id con meta (no viene en este payload, pero lo dejamos por si acaso)
  if (!pago && custom?.checkout_id) {
    const checkoutResponse = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('checkout_id', String(custom.checkout_id))
      .maybeSingle()
    const row = checkoutResponse.data as PagoRow | null
    if (row) pago = row
  }

  // Si aún no lo encontramos pero tenemos pistas de reserva/inscripción, puedes hacer otro fallback (opcional):
  if (!pago && reservaIdMeta !== null) {
    const reservaResponse = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('reserva_id', reservaIdMeta)
      .limit(1)
    const rows = reservaResponse.data as PagoRow[] | null
    if (rows && rows.length > 0) pago = rows[0]
  }
  if (!pago && inscripcionIdMeta !== null) {
    const inscripcionResponse = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('inscripcion_id', inscripcionIdMeta)
      .limit(1)
    const rows = inscripcionResponse.data as PagoRow[] | null
    if (rows && rows.length > 0) pago = rows[0]
  }

  if (!pago) {
    // Guardamos evento y respondemos 202 para que Lemon reintente
    if (webhookId) {
      await supabaseAdmin.from('webhook_events').insert({
        id: webhookId, event_name: eventName, order_id: orderId ?? null
      })
    }
    return NextResponse.json({ ok: true, reason: 'pago_not_found' }, { status: 202 })
  }

  const previousEstado = normalizePagoEstado(pago.estado)

  // 6) Actualizar pago y entidades relacionadas
  const updates: PagoUpdate = { estado }
  if (orderId) updates.order_id = String(orderId)
  if (total != null) updates.monto_centavos = total
  if (currency) updates.moneda = currency

  await supabaseAdmin.from('pagos').update(updates).eq('id', pago.id)

  // paid = TRUE solo si estado === 'pagado'
  const paid = estado === 'pagado'

  // Preferimos los ids que ya tiene el pago
  const reservaId = pago.reserva_id ?? reservaIdMeta
  const inscripcionId = pago.inscripcion_id ?? inscripcionIdMeta

  if (reservaId != null) {
    await supabaseAdmin.from('reservas').update({ paid }).eq('id', reservaId)
  }
  if (inscripcionId != null) {
    await supabaseAdmin.from('inscripciones').update({ paid }).eq('id', inscripcionId)
  }

  //console.log('[WEBHOOK] pago', { id: pago.id, previousEstado, nextEstado: estado, reservaId, inscripcionId })

  await notifyPagoConfirmado({
    previousEstado,
    nextEstado: estado,
    reservaId,
    inscripcionId
  }).catch((e) => {
    console.error('[WEBHOOK] notifyPagoConfirmado failed', e)
  })

  // 7) Registrar evento (idempotencia)
  if (webhookId) {
    await supabaseAdmin.from('webhook_events').insert({
      id: webhookId, event_name: eventName, order_id: orderId ?? null
    })
  }

  return NextResponse.json({ ok: true, estado, orderId })
}
