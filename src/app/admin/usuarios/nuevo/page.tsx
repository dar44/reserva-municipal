import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export default async function NewUsuarioPage () {
  async function createUsuario (formData: FormData) {
    'use server'
    const data = {
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      dni: formData.get('dni') as string,
      role: formData.get('role') as string,
      image: ((formData.get('image') as string) || '').trim() || null
    }

    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        surname: data.surname,
        dni: data.dni,
        phone: data.phone,
        image: data.image
      },
      app_metadata: { role: data.role }
    })

    revalidatePath('/admin/usuarios')
    redirect('/admin/usuarios')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
      <form action={createUsuario} className="space-y-3 bg-gray-800 p-4 rounded text-sm">
        <input name="name" className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <input name="surname" className="w-full p-2 rounded bg-gray-700" placeholder="Apellido" required />
        <input name="email" type="email" className="w-full p-2 rounded bg-gray-700" placeholder="Email" required />
        <input name="password" type="password" className="w-full p-2 rounded bg-gray-700" placeholder="Password" required />
        <input name="phone" className="w-full p-2 rounded bg-gray-700" placeholder="Teléfono" required />
        <input name="dni" className="w-full p-2 rounded bg-gray-700" placeholder="DNI" required />
        <input name="image" className="w-full p-2 rounded bg-gray-700" placeholder="URL de imagen" />
        <select name="role" className="w-full p-2 rounded bg-gray-700">
          <option value="citizen">citizen</option>
          <option value="worker">worker</option>
          <option value="admin">admin</option>
        </select>
        <div className="space-x-2">
          <button type="submit" className="bg-blue-600 px-3 py-1 rounded">Crear</button>
          <Link href="/admin/usuarios" className="text-gray-300">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}