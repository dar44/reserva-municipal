import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function UsuarioDeletePage ({ params }: Props) {
  const { id } = await params

  async function deleteUsuario () {
    'use server'
    await supabaseAdmin.auth.admin.deleteUser(id)
    revalidatePath('/admin/usuarios')
    redirect('/admin/usuarios')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Eliminar usuario</h1>
      <p className="text-sm">¿Estás seguro de eliminar el usuario? Se perderán sus datos.</p>
      <div className="space-x-2">
        <form action={deleteUsuario} className="inline">
          <button className="text-red-400" type="submit">Aceptar</button>
        </form>
        <Link href={`/admin/usuarios/${id}`} className="text-blue-400">Cancelar</Link>
      </div>
    </div>
  )
}