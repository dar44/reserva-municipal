import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type Estado = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'cancelado'

export function mapEstado (eventName?: string, status?: string): Estado | null {
  const e = (eventName ?? '').toLowerCase()
  const s = (status ?? '').toLowerCase()

  const isOrderEvent =
    e.startsWith('order_') ||
    [
      'paid',
      'refunded',
      'failed',
      'cancelled',
      'expired',
      'pending',
      'completed',
      'success',
      'succeeded'
    ].includes(s)
  if (!isOrderEvent) return null

  const paidEvents = new Set([
    'order_created',
    'order_paid',
    'order_payment_success',
    'order_payment_succeeded',
    'order_completed',
    'order_success'
  ])

  if (paidEvents.has(e) || ['paid', 'completed', 'success', 'succeeded'].includes(s)) return 'pagado'
  if (e === 'order_refunded' || s === 'refunded') return 'reembolsado'
  if (e === 'order_payment_failed' || s === 'failed') return 'fallido'
  if (e === 'order_expired' || e === 'order_cancelled' || s === 'expired' || s === 'cancelled') return 'cancelado'
  if (s === 'pending' || e === 'order_pending') return 'pendiente'
  return null
}

export async function updateRelated (
  table: 'reservas' | 'inscripciones',
  id: number,
  estado: Estado
) {
  const setPaid = { paid: estado === 'pagado' }
  const setFull: Record<string, unknown> = { ...setPaid, estado }

  let res = await supabaseAdmin.from(table).update(setFull).eq('id', id).select('id').single()

  if (
    res.error &&
    (res.error.code === '42703' || /column .*estado.* does not exist/i.test(res.error.message))
  ) {
    res = await supabaseAdmin.from(table).update(setPaid).eq('id', id).select('id').single()
  }

  if (res.error) throw new Error(`${table}_update_failed: ${res.error.message}`)
  return res.data
}