import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  try {
    const { curso_id, email, newUser, name, surname, dni, phone } = await req.json()

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
        const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || 'https://dar44.netlify.app/auth/update-password'
        await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })

    
        uid = auth.user.id
      } else {
        return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
      }
    }

    const { error: insErr } = await supabaseAdmin.from('inscripciones').insert({
      curso_id,
      user_uid: uid
    })
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}