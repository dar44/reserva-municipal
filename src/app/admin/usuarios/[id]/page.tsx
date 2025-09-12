import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'


export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function UsuarioDetailPage ({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServer()
  const { data: usuario } = await supabase
    .from('users')
    .select('uid,image,name,surname,email,phone,dni,role')
    .eq('uid', id)
    .single()

  if (!usuario) redirect('/admin/usuarios')


  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link href="/admin/usuarios" className="text-blue-400 text-sm">&larr; Volver</Link>
        <h1 className="text-2xl font-bold">Detalles del Usuario</h1>
      </div>

      <div className="bg-gray-800 p-4 rounded space-y-2 text-sm">
        {usuario.image && (
          <Image src={usuario.image} alt={usuario.name} width={80} height={80} className="w-20 h-20 object-cover rounded" />
        )}
        <p><strong>Nombre:</strong> {usuario.name}</p>
        <p><strong>Apellido:</strong> {usuario.surname}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Teléfono:</strong> {usuario.phone}</p>
        <p><strong>DNI:</strong> {usuario.dni}</p>
        <p><strong>Rol:</strong> {usuario.role}</p>
      </div>

      <div className="space-x-2">
        <Link href={`/admin/usuarios/${id}/editar`} className="text-yellow-400">Editar</Link>
        <DeleteButton id={id} />
      </div>
    </div>
  )
}