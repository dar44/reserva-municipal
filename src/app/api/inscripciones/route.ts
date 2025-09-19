import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  createCheckout,
  getInscripcionVariantId,
  getLemonStoreId
} from '@/lib/lemonSqueezy'
import { toMinorUnits } from '@/lib/currency'
import { getConfiguredCurrency } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  try {
    const { curso_id, email, newUser, name, surname, dni, phone } = await req.json()
    const { origin } = new URL(req.url)
    const currency = getConfiguredCurrency()

    const query = supabaseAdmin
      .from('users')
      .select('uid')
      .eq('email', email)

    if (dni) {
      query.eq('dni', dni)
    }

    const { data: existing } = await query.maybeSingle()

    let uid = existing?.uid

    if (!uid) {
      if (newUser) {
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
    }

    const { data: curso, error: cursoErr } = await supabaseAdmin
      .from('cursos')
      .select('price')
      .eq('id', curso_id)
      .maybeSingle()
    if (cursoErr) {
      return NextResponse.json({ error: cursoErr.message }, { status: 400 })
    }
    const price = Number(curso?.price ?? 0)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'course_price_invalid' }, { status: 400 })
    }
    const amountMinorUnits = toMinorUnits(price, currency)

    const { data: inscripcion, error: insErr } = await supabaseAdmin.from('inscripciones').insert({
      curso_id,
      user_uid: uid
    }).select('id').single()
    if (insErr || !inscripcion) {
      return NextResponse.json({ error: insErr.message }, { status: 400 })
    }

    const { data: pago, error: pagoErr } = await supabaseAdmin.from('pagos').insert({
      user_uid: uid!,
      inscripcion_id: inscripcion.id,
      monto_centavos: amountMinorUnits,
      moneda: currency,
      estado: 'pendiente',
      gateway: 'lemon_squeezy'
    }).select('id').single()
    if (pagoErr || !pago) {
      await supabaseAdmin.from('inscripciones').delete().eq('id', inscripcion.id)
      return NextResponse.json({ error: pagoErr?.message || 'payment_error' }, { status: 400 })
    }

    let checkout
    try {
      checkout = await createCheckout({
        variantId: getInscripcionVariantId(),
        storeId: getLemonStoreId(),
        customPrice: amountMinorUnits,
        customerEmail: email,
        successUrl: `${origin}/pagos/exito?pago=${pago.id}&tipo=inscripcion`,
        cancelUrl: `${origin}/pagos/cancelado?pago=${pago.id}&tipo=inscripcion`,
        metadata: {
          pago_id: pago.id,
          tipo: 'inscripcion',
          inscripcion_id: inscripcion.id,
          curso_id
        }
      })
    } catch (error) {
      await supabaseAdmin.from('pagos').delete().eq('id', pago.id)
      await supabaseAdmin.from('inscripciones').delete().eq('id', inscripcion.id)
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