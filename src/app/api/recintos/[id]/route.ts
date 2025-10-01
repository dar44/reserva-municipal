import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { removeRecintoImage } from '@/lib/recintoImages'

export const dynamic = 'force-dynamic'

export async function DELETE (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: recinto, error: fetchError } = await supabase
    .from('recintos')
    .select('image,image_bucket')
    .eq('id', id)
    .single()
  if (fetchError) {
    if ('code' in fetchError && fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ error: fetchError.message }, { status: 400 })
  }

  if (recinto) {
    await removeRecintoImage(supabase, recinto.image, recinto.image_bucket)
  }

  const { error } = await supabase.from('recintos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  revalidatePath('/admin/recintos')
  revalidatePath('/worker/recintos')
  revalidatePath('/recintos')
  revalidatePath(`/recintos/${id}`)
  return NextResponse.json({ ok: true })
}