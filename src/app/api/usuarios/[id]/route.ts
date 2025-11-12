import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAuthAPI } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export async function DELETE (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAuthAPI(['admin'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase } = auth
  const { error } = await supabase.from('users').delete().eq('uid', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  revalidatePath('/admin/usuarios')
  return NextResponse.json({ ok: true })
}