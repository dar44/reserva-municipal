import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createSupabaseServer } from '@/lib/supabaseServer'
import {
  createCheckout,
  getLemonStoreId,
  getReservaVariantId
} from '@/lib/lemonSqueezy'
import { toMinorUnits } from '@/lib/currency'
import { getConfiguredCurrency, getReservaPriceValue } from '@/lib/config'
import { hasRecintoConflicts } from '@/lib/reservas/conflicts'

export const dynamic = 'force-dynamic'

function getIsoRangeFromDateTime (date: string, time: string) {
  const [yearStr, monthStr, dayStr] = date.split('-')
  const [hourStr, minuteStr] = time.split(':')

  if (!yearStr || !monthStr || !dayStr || !hourStr || minuteStr === undefined) {
    return null
  }

  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const hour = Number(hourStr)
  const minute = Number(minuteStr)

  if ([year, month, day, hour, minute].some(n => Number.isNaN(n))) {
    return null
  }

  const startAt = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)

  return {
    startIso: startAt.toISOString(),
    endIso: endAt.toISOString()
  }
}

async function checkRecintoAvailability (recintoId: number, startIso: string, endIso: string) {
  return hasRecintoConflicts({
    supabase: supabaseAdmin,
    recintoId,
    startAt: startIso,
    endAt: endIso,
    courseStatuses: ['aprobada'],
  })
}

export async function POST (req: Request) {
  try {
    const { origin } = new URL(req.url)

    const currency = getConfiguredCurrency()
    const reservaPrice = getReservaPriceValue()
    const amountMinorUnits = toMinorUnits(reservaPrice, currency)

    if (req.headers.get('content-type')?.includes('application/json')) {
      const { email, date, time, recinto_id, newUser, name, surname, dni, phone} = await req.json()

      const recintoId = Number(recinto_id)
      if (Number.isNaN(recintoId)) {
        return NextResponse.json({ error: 'invalid_recinto' }, { status: 400 })
      }

      const isoRange = getIsoRangeFromDateTime(date, time)
      if (!isoRange) {
        return NextResponse.json({ error: 'invalid_datetime' }, { status: 400 })
      }
      const { startIso, endIso } = isoRange

      const availability = await checkRecintoAvailability(recintoId, startIso, endIso)
      if (availability.error) {
        return NextResponse.json({ error: availability.error.message }, { status: 400 })
      }

      if (availability.conflict) {
        return NextResponse.json({
          error: 'Ese horario ya está reservado. Por favor elige otro horario.'
        }, { status: 409 })
      }

      let uid
      // Comprobar si el usuario ya existe por email para evitar errores de clave duplicada
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('uid')
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        uid = existing.uid
      } else if (newUser) {
        const password = Math.random().toString(36).slice(-8)
        const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, surname, dni, phone },
          app_metadata: { role: 'citizen' }
        })
        if (authErr || !auth.user) {
          return NextResponse.json({ error: authErr?.message || 'auth_error' }, { status: 400 })
        }

        const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL
        if (!redirectUrl) {
          return NextResponse.json({
            error: 'Config error: NEXT_PUBLIC_AUTH_REDIRECT_URL no está definida'
          }, { status: 500 })
        }
        await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })

        uid = auth.user.id

      } else {
        return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
      }

      const { data: reserva, error: resErr } = await supabaseAdmin.from('reservas').insert({
        user_uid: uid,
        recinto_id: recintoId,
        price: reservaPrice,
        start_at: startIso,
        end_at: endIso
      }).select('id').single()
      if (resErr || !reserva) {
        return NextResponse.json({ error: resErr.message }, { status: 400 })
      }

      const { data: pago, error: pagoErr } = await supabaseAdmin.from('pagos').insert({
        user_uid: uid,
        reserva_id: reserva.id,
        monto_centavos: amountMinorUnits,
        moneda: currency,
        estado: 'pendiente',
        gateway: 'lemon_squeezy'
      }).select('id').single()
      if (pagoErr || !pago) {
        await supabaseAdmin.from('reservas').delete().eq('id', reserva.id)
        return NextResponse.json({ error: pagoErr?.message || 'payment_error' }, { status: 400 })
      }

      const storeId = getLemonStoreId()
      const variantId = getReservaVariantId()

      const metadata = {
        pago_id: pago.id,
        tipo: 'reserva',
        reserva_id: reserva.id
      }
      let checkout
      const successBase = '/pagos/exito'
      const cancelBase = '/pagos/cancelado'
      try {
        checkout = await createCheckout({
          variantId,
          storeId,
          customPrice: amountMinorUnits,
          customerEmail: email,
          successUrl: `${origin}${successBase}?pago=${pago.id}&tipo=reserva`,
          cancelUrl: `${origin}${cancelBase}?pago=${pago.id}&tipo=reserva`,
          metadata
        })
      } catch (error) {
        await supabaseAdmin.from('pagos').delete().eq('id', pago.id)
        await supabaseAdmin.from('reservas').delete().eq('id', reserva.id)
        throw error
      }

      await supabaseAdmin
        .from('pagos')
        .update({ checkout_id: checkout.id })
        .eq('id', pago.id)

      return NextResponse.json({ checkoutUrl: checkout.url, pagoId: pago.id })
    }

    const formData = await req.formData()
    const recintoId = Number(formData.get('recinto_id'))
    const date = formData.get('date') as string
    const slot = (formData.get('slot') as string) || ''
    const time = slot.split('-')[0]

    if (Number.isNaN(recintoId)) {
      return NextResponse.json({ error: 'invalid_recinto' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const isoRange = getIsoRangeFromDateTime(date, time)
    if (!isoRange) {
      return NextResponse.json({ error: 'invalid_datetime' }, { status: 400 })
    }
    const { startIso, endIso } = isoRange

    const availability = await checkRecintoAvailability(recintoId, startIso, endIso)
    if (availability.error) {
      return NextResponse.json({ error: availability.error.message }, { status: 400 })
    }

    if (availability.conflict) {
      return NextResponse.json({
        error: 'Ese horario ya está reservado. Por favor elige otro horario.'
      }, { status: 409 })
    }

    const { data: reserva, error: resErr } = await supabaseAdmin.from('reservas').insert({
      user_uid: user.id,
      recinto_id: recintoId,
      price: reservaPrice,
      start_at: startIso,
      end_at: endIso
    }).select('id').single()
    if (resErr || !reserva) {
      return NextResponse.json({ error: resErr.message }, { status: 400 })
    }

    const { data: pago, error: pagoErr } = await supabaseAdmin.from('pagos').insert({
      user_uid: user.id,
      reserva_id: reserva.id,
      monto_centavos: amountMinorUnits,
      moneda: currency,
      estado: 'pendiente',
      gateway: 'lemon_squeezy'
    }).select('id').single()
    if (pagoErr || !pago) {
      await supabaseAdmin.from('reservas').delete().eq('id', reserva.id)
      return NextResponse.json({ error: pagoErr?.message || 'payment_error' }, { status: 400 })
    }

    let checkout
    try {
      checkout = await createCheckout({
        variantId: getReservaVariantId(),
        storeId: getLemonStoreId(),
        customPrice: amountMinorUnits,
        customerEmail: user.email ?? '',
        successUrl: `${origin}/pagos/exito?pago=${pago.id}&tipo=reserva`,
        cancelUrl: `${origin}/pagos/cancelado?pago=${pago.id}&tipo=reserva`,
        metadata: {
          pago_id: pago.id,
          tipo: 'reserva',
          reserva_id: reserva.id
        }
      })
    } catch (error) {
      await supabaseAdmin.from('pagos').delete().eq('id', pago.id)
      await supabaseAdmin.from('reservas').delete().eq('id', reserva.id)
      throw error
    }

    await supabaseAdmin
      .from('pagos')
      .update({ checkout_id: checkout.id })
      .eq('id', pago.id)

    return NextResponse.json({ checkoutUrl: checkout.url, pagoId: pago.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}