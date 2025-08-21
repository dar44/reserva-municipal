import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function POST (_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('recintos')
    .select('state')
    .eq('id', params.id)
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message || 'not_found' }, { status: 404 })

  const newState = data.state === 'Disponible' ? 'No disponible' : 'Disponible'
  const { error: updErr } = await supabase
    .from('recintos')
    .update({ state: newState })
    .eq('id', params.id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

  return NextResponse.json({ state: newState })
}