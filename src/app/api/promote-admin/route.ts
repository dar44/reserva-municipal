import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { email } = await req.json()

  // 1) Obtener uid del usuario en Auth
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
  if (listErr) return NextResponse.json(listErr, { status: 400 })
  const user = listData?.users?.find((u: any) => u.email === email)
  if (!user) return NextResponse.json({ message: 'user_not_found' }, { status: 404 })

  // 2) Obtener id de la fila en public.users
  const { data: row, error: rowErr } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  if (rowErr) return NextResponse.json(rowErr, { status: 400 })

  // 3) Añadir claims role y user_id al JWT
  const { error: claimErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'admin', user_id: row.id }
  })
  if (claimErr) return NextResponse.json(claimErr, { status: 400 })

  // 4) Actualizar role en public.users
  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({ role: 'admin' })
    .eq('id', row.id)
  if (updateErr) return NextResponse.json(updateErr, { status: 400 })

  return NextResponse.json({ message: 'promoted_to_admin' })
}
export const dynamic = 'force-dynamic'