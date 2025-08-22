import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function RecintoDeletePage ({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  async function deleteRecinto () {
    'use server'
    const supabase = await createSupabaseServer()
    await supabase.from('recintos').delete().eq('id', id)
    revalidatePath('/admin/recintos')
    redirect('/admin/recintos')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Eliminar recinto</h1>
      <p className="text-sm">¿Estás seguro de eliminar el recinto? Se perderán sus datos.</p>
      <div className="space-x-2">
        <form action={deleteRecinto} className="inline">
          <button className="text-red-400" type="submit">Aceptar</button>
        </form>
        <Link href={`/admin/recintos/${id}`} className="text-blue-400">Cancelar</Link>
      </div>
    </div>
  )
}