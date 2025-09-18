import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createSupabaseServer } from '@/lib/supabaseServer'
import {
  createCheckout,
  getLemonStoreId,
  getReservaVariantId
} from '@/lib/lemonSqueezy'

export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  try {
    const { origin } = new URL(req.url)

    if (req.headers.get('content-type')?.includes('application/json')) {
      const { email, date, time, recinto_id, newUser, name, surname, dni, phone } = await req.json()

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

      const startAt = new Date(`${date}T${time}:00`)
      const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)
      const priceEuro = Number(process.env.RESERVA_PRICE_EUR ?? '1')
      if (!Number.isFinite(priceEuro) || priceEuro <= 0) {
        return NextResponse.json({ error: 'Config error: RESERVA_PRICE_EUR inválido' }, { status: 500 })
      }
      const amountCents = Math.round(priceEuro * 100)

      const { data: reserva, error: resErr } = await supabaseAdmin.from('reservas').insert({
        user_uid: uid,
        recinto_id,
        price: priceEuro,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString()
      }).select('id').single()
      if (resErr || !reserva) {
        return NextResponse.json({ error: resErr.message }, { status: 400 })
      }

      const { data: pago, error: pagoErr } = await supabaseAdmin.from('pagos').insert({
        user_uid: uid,
        reserva_id: reserva.id,
        monto_centavos: amountCents,
        moneda: 'EUR',
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
      try {
        checkout = await createCheckout({
          variantId,
          storeId,
          customPrice: amountCents,
          customerEmail: email,
          successUrl: `${origin}/pagos/exito?pago=${pago.id}&tipo=reserva`,
          cancelUrl: `${origin}/pagos/cancelado?pago=${pago.id}&tipo=reserva`,
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
    const recinto_id = Number(formData.get('recinto_id'))
    const date = formData.get('date') as string
    const slot = (formData.get('slot') as string) || ''
    const time = slot.split('-')[0]

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const startAt = new Date(`${date}T${time}:00`)
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)
    const priceEuro = Number(process.env.RESERVA_PRICE_EUR ?? '1')
    if (!Number.isFinite(priceEuro) || priceEuro <= 0) {
      return NextResponse.json({ error: 'Config error: RESERVA_PRICE_EUR inválido' }, { status: 500 })
    }
    const amountCents = Math.round(priceEuro * 100)

    const { data: reserva, error: resErr } = await supabaseAdmin.from('reservas').insert({
      user_uid: user.id,
      recinto_id,
      price: priceEuro,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString()
    }).select('id').single()
    if (resErr || !reserva) {
      return NextResponse.json({ error: resErr.message }, { status: 400 })
    }

    const { data: pago, error: pagoErr } = await supabaseAdmin.from('pagos').insert({
      user_uid: user.id,
      reserva_id: reserva.id,
      monto_centavos: amountCents,
      moneda: 'EUR',
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
        customPrice: amountCents,
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

    return NextResponse.redirect(checkout.url, { status: 303 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}