import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  try {
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
      uid = auth.user.id
      
    } else {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    }

    const startAt = new Date(`${date}T${time}:00`)
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)

    const { error: resErr } = await supabaseAdmin.from('reservas').insert({
      user_uid: uid,
      recinto_id,
      price: 1,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString()
    })
    if (resErr) {
      return NextResponse.json({ error: resErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}