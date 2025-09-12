import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

// GET /api/recintos - devuelve la lista de recintos disponibles
export async function GET () {
  const { data, error } = await supabaseAdmin
    .from('recintos')
    .select('id,name,ubication,state')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ recintos: data })
}