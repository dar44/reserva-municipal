import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  getCheckout,
  getOrder
} from '@/lib/lemonSqueezy'
import { mapEstado, updateRelated } from '@/app/api/lemon/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { params: { id: string } }

function parsePagoId (rawId: string): number | null {
  const id = Number(rawId)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function POST (_req: Request, { params }: Params) {
  const pagoId = parsePagoId(params.id)
  if (!pagoId) {
    return NextResponse.json({ error: 'invalid_pago_id' }, { status: 400 })
  }

  const { data: pago, error: pagoErr } = await supabaseAdmin
    .from('pagos')
    .select('id,estado,order_id,checkout_id,reserva_id,inscripcion_id,moneda,monto_centavos')
    .eq('id', pagoId)
    .maybeSingle()

  if (pagoErr || !pago) {
    return NextResponse.json({ error: pagoErr?.message || 'pago_not_found' }, { status: 404 })
  }

  if (pago.estado === 'pagado') {
    return NextResponse.json({ ok: true, estado: pago.estado, updated: false })
  }

  let orderId = pago.order_id ?? null
  let checkoutStatus: string | undefined

  try {
    if (!orderId && pago.checkout_id) {
      const checkout = await getCheckout(pago.checkout_id)
      checkoutStatus = checkout.status ?? undefined
      if (checkout.orderId) {
        orderId = checkout.orderId
        await supabaseAdmin.from('pagos').update({ order_id: orderId }).eq('id', pagoId)
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'checkout_fetch_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  if (!orderId) {
    const estadoCheckout = mapEstado('order_pending', checkoutStatus)
    return NextResponse.json({
      ok: true,
      estado: estadoCheckout ?? 'pendiente',
      updated: false,
      reason: 'missing_order'
    }, { status: 202 })
  }

  let orderStatus: { status?: string | null; total?: number | null; currency?: string | null }
  try {
    orderStatus = await getOrder(orderId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'order_fetch_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const estado = mapEstado(undefined, orderStatus.status ?? undefined)
  if (!estado) {
    return NextResponse.json({
      ok: true,
      estado: 'pendiente',
      updated: false,
      reason: 'unknown_status'
    }, { status: 202 })
  }

  const updateFields: Record<string, unknown> = { estado }
  if (orderStatus.total != null) updateFields.monto_centavos = orderStatus.total
  if (orderStatus.currency) updateFields.moneda = orderStatus.currency

  const { error: updateError } = await supabaseAdmin
    .from('pagos')
    .update(updateFields)
    .eq('id', pagoId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  try {
    if (pago.reserva_id) await updateRelated('reservas', pago.reserva_id as number, estado)
    if (pago.inscripcion_id) await updateRelated('inscripciones', pago.inscripcion_id as number, estado)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'related_update_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const statusCode = estado === 'pagado' ? 200 : 202

  return NextResponse.json({ ok: true, estado, updated: true, orderId }, { status: statusCode })
}