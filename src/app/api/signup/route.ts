import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendRegistroConfirmadoEmail } from '@/lib/emailNotifications'

export async function POST(req: Request) {
  try {
    const { email, password, name, surname, dni, phone } = await req.json()

    /* 1) Crea usuario en Auth ------------------------------ */
    const { data: auth, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,          // salta el email si tu proyecto lo permite
        user_metadata: { name, surname, dni, phone },
        app_metadata: { role: 'citizen' }
      })
    if (authErr) return NextResponse.json(authErr, { status: 400 })

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(auth.user.id, {
      app_metadata: { role: 'citizen' }
    })
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

    // Enviar email de bienvenida
    try {
      await sendRegistroConfirmadoEmail(auth.user.id)
    } catch (emailError) {
      console.error('Error sending registration email:', emailError)
      // No fallar el registro si el email falla
    }

    return NextResponse.json({ ok: true, uid: auth.user.id })
  } catch (e: unknown) {
    const message = (e as Error)?.message ?? 'signup_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}