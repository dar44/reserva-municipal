import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST (req: Request) {
  const { email, password, name, surname, dni, phone } = await req.json()

  /* 1) Crea usuario en Auth ------------------------------ */
  const { data: auth, error: authErr } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // salta el email si tu proyecto lo permite
      app_metadata: { role: 'citizen' }
    })
  if (authErr) return NextResponse.json(authErr, { status: 400 })

  /* 2) Inserta fila en public.users ---------------------- */
  const { data: row, error: dbErr } = await supabaseAdmin
    .from('users')
    .insert({
      name, surname, dni, email, phone, role: 'citizen'
    })
    .select('id')
    .single()
  if (dbErr) return NextResponse.json(dbErr, { status: 400 })

  /* 3) Añade claim user_id al JWT ------------------------ */
  await supabaseAdmin.auth.admin.updateUserById(auth.user.id, {
    app_metadata: { role: 'citizen', user_id: row.id }
  })

  return NextResponse.json({ message: 'signup_ok' })
}
