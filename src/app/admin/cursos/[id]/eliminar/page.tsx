import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function CursoDeletePage ({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  async function deleteCurso () {
    'use server'
    const supabase = await createSupabaseServer()
    const { error } = await supabase.from('cursos').delete().eq('id', id)
    if (error) {
      console.error('DELETE cursos error:', error)
      throw new Error(error.message)
    }
    revalidatePath('/admin/cursos')
    redirect('/admin/cursos')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Eliminar curso</h1>
      <p className="text-sm">¿Estás seguro de eliminar el curso? Se perderán sus datos.</p>
      <div className="space-x-2">
        <form action={deleteCurso} className="inline">
          <button className="text-red-400" type="submit">Aceptar</button>
        </form>
        <Link href={`/admin/cursos/${id}`} className="text-blue-400">Cancelar</Link>
      </div>
    </div>
  )
}