import Link from 'next/link'
import Image from 'next/image'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Usuario = {
  id: string
  image: string | null
  name: string
  email: string
  phone: string
  dni: string
  role: string
}

export default async function AdminUsuariosPage () {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('users')
    .select('uid,image,name,email,phone,dni,role')
    .order('name')
  const usuarios: Usuario[] = (data ?? []).map(u => ({
    id: u.uid,
    image: u.image,
    name: u.name,
    email: u.email,
    phone: u.phone,
    dni: u.dni,
    role: u.role
  }))

  async function deleteUsuario (formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    await supabaseAdmin.auth.admin.deleteUser(id)
    revalidatePath('/admin/usuarios')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link href="/admin/usuarios/nuevo" className="bg-blue-600 px-3 py-1 rounded text-sm">+ Nuevo Usuario</Link>
      </div>
      <table className="min-w-full bg-gray-800 rounded overflow-hidden text-sm">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Teléfono</th>
            <th className="px-4 py-2 text-left">DNI</th>
            <th className="px-4 py-2 text-left">Rol</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios?.map(u => (
            <tr key={u.id} className="border-t border-gray-700">
              <td className="px-4 py-2">
                {u.image ? (
                  <Image
                    src={u.image}
                    alt={u.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.phone}</td>
              <td className="px-4 py-2">{u.dni}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2 space-x-2">
                <Link href={`/admin/usuarios/${u.id}`} className="text-blue-400">Ver</Link>
                <Link href={`/admin/usuarios/${u.id}/editar`} className="text-yellow-400">Modificar</Link>
                <form action={deleteUsuario} className="inline">
                  <input type="hidden" name="id" value={u.id} />
                  <button className="text-red-400" type="submit">Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}