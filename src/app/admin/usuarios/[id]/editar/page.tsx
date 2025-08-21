import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditUsuarioPage ({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServer()
  const { data: usuario } = await supabase
    .from('users')
    .select('uid,image,name,surname,email,phone,dni,role')
    .eq('uid', id)
    .single()

  if (!usuario) redirect('/admin/usuarios')

  async function updateUsuario (formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const payload = {
      name: String(formData.get('name') || ''),
      surname: String(formData.get('surname') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      dni: String(formData.get('dni') || ''),
      image: ((formData.get('image') as string) || '').trim() || null,
      role: String(formData.get('role') || 'citizen')
    }
    const password = (formData.get('password') as string) || ''

    await supabaseAdmin.auth.admin.updateUserById(id, {
      email: payload.email,
      password: password || undefined,
      user_metadata: {
        name: payload.name,
        surname: payload.surname,
        dni: payload.dni,
        phone: payload.phone,
        image: payload.image
      },
      app_metadata: { role: payload.role }
    })

    await supabase.from('users').update({
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      phone: payload.phone,
      dni: payload.dni,
      image: payload.image,
      role: payload.role,
      updated_at: new Date().toISOString()
    }).eq('uid', id)

    revalidatePath(`/admin/usuarios/${id}`)
    revalidatePath('/admin/usuarios')
    redirect(`/admin/usuarios/${id}`)
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/usuarios/${id}`} className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Editar Usuario</h1>

      <form action={updateUsuario} className="space-y-3 bg-gray-800 p-4 rounded text-sm">
        <input name="name" defaultValue={usuario.name} className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <input name="surname" defaultValue={usuario.surname} className="w-full p-2 rounded bg-gray-700" placeholder="Apellido" required />
        <input name="email" defaultValue={usuario.email} className="w-full p-2 rounded bg-gray-700" placeholder="Email" required />
        <input name="phone" defaultValue={usuario.phone} className="w-full p-2 rounded bg-gray-700" placeholder="Teléfono" required />
        <input name="dni" defaultValue={usuario.dni} className="w-full p-2 rounded bg-gray-700" placeholder="DNI" required />
        <input name="image" defaultValue={usuario.image ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="URL de imagen" />
        <select name="role" defaultValue={usuario.role} className="w-full p-2 rounded bg-gray-700">
          <option value="citizen">citizen</option>
          <option value="worker">worker</option>
          <option value="admin">admin</option>
        </select>
        <input name="password" type="password" className="w-full p-2 rounded bg-gray-700" placeholder="Nuevo password (opcional)" />
        <div className="space-x-2">
          <button type="submit" className="bg-blue-600 px-3 py-1 rounded">Guardar</button>
          <Link href={`/admin/usuarios/${id}`} className="text-gray-300">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}