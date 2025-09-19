import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyWebhookSignature } from '@/lib/lemonSqueezy' // ya la tienes
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type PagoEstado = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'cancelado'

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
  let body: any
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const eventName: string = body?.meta?.event_name ?? ''
  const webhookId: string | undefined = body?.meta?.webhook_id
  const custom: Record<string, any> = body?.meta?.custom_data ?? {}
  const data: any = body?.data ?? {}
  const attrs: any = data?.attributes ?? {}

  const orderId: string | null = data?.id ? String(data.id) : null
  const orderStatus: string | null = typeof attrs?.status === 'string' ? attrs.status : null
  const total: number | null = (typeof attrs?.total === 'number') ? attrs.total : null
  const currency: string | null = typeof attrs?.currency === 'string' ? attrs.currency : null

  // 3) Idempotencia: si ya procesamos este webhook_id, devolvemos 200
  if (webhookId) {
    const existing = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('id', webhookId)
      .maybeSingle()
    if ((existing as PostgrestSingleResponse<any>).data?.id) {
      return NextResponse.json({ ok: true, duplicate: true })
    }
  }

  // 4) Determinar estado final
  //    - prioridad: nombre de evento → 'pagado' si order_paid
  //    - si no, mapear por status de la order
  let estado: PagoEstado =
    estadoFromEventName(eventName) ?? mapOrderStatusToPagoEstado(orderStatus)

  // ⚠️ Requisito del usuario: “que se cambie sí o sí a pagado” cuando sea una compra correcta.
  // Con el payload que nos pasaste (order_created con attributes.status = "paid"),
  // este mapeo ya da 'pagado'. No forzamos pagado si el evento es de fallo/refund.
  // Si AÚN así quieres forzar 'pagado' en TODOS los order_created/test_mode: descomenta abajo.
  // if (eventName === 'order_created' && attrs?.test_mode === true) estado = 'pagado'

  // 5) Localizar el pago
  const pagoIdMeta: string | undefined = custom?.pago_id
  const reservaIdMeta: number | null = custom?.reserva_id ? Number(custom.reserva_id) : null
  const inscripcionIdMeta: number | null = custom?.inscripcion_id ? Number(custom.inscripcion_id) : null

  // Preferimos buscar por pago_id de metadata (es lo más fiable)
  let pago: any = null
  if (pagoIdMeta) {
    const { data: row } = await supabaseAdmin.from('pagos').select('*').eq('id', pagoIdMeta).maybeSingle()
    pago = row
  }
  // Fallback por order_id
  if (!pago && orderId) {
    const { data: row } = await supabaseAdmin.from('pagos').select('*').eq('order_id', String(orderId)).maybeSingle()
    pago = row
  }
  // Fallback por checkout_id con meta (no viene en este payload, pero lo dejamos por si acaso)
  if (!pago && custom?.checkout_id) {
    const { data: row } = await supabaseAdmin.from('pagos').select('*').eq('checkout_id', String(custom.checkout_id)).maybeSingle()
    pago = row
  }

  // Si aún no lo encontramos pero tenemos pistas de reserva/inscripción, puedes hacer otro fallback (opcional):
  if (!pago && (reservaIdMeta || inscripcionIdMeta)) {
    const q = supabaseAdmin.from('pagos').select('*').limit(1)
    if (reservaIdMeta) q.eq('reserva_id', reservaIdMeta)
    if (inscripcionIdMeta) q.eq('inscripcion_id', inscripcionIdMeta)
    const { data: rows } = await q
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

  // 6) Actualizar pago y entidades relacionadas
  const updates: Record<string, any> = { estado }
  if (orderId) updates.order_id = String(orderId)
  if (total != null) updates.monto_centavos = total
  if (currency) updates.moneda = currency

  await supabaseAdmin.from('pagos').update(updates).eq('id', pago.id)

  // paid = TRUE solo si estado === 'pagado'
  const paid = estado === 'pagado'

  // Preferimos los ids que ya tiene el pago
  const reservaId = pago.reserva_id ?? reservaIdMeta
  const inscripcionId = pago.inscripcion_id ?? inscripcionIdMeta

  if (reservaId) {
    await supabaseAdmin.from('reservas').update({ paid }).eq('id', reservaId as number)
  }
  if (inscripcionId) {
    await supabaseAdmin.from('inscripciones').update({ paid }).eq('id', inscripcionId as number)
  }

  // 7) Registrar evento (idempotencia)
  if (webhookId) {
    await supabaseAdmin.from('webhook_events').insert({
      id: webhookId, event_name: eventName, order_id: orderId ?? null
    })
  }

  return NextResponse.json({ ok: true, estado, orderId })
}
