import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createSupabaseServer } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  USER_DEFAULTS_FOLDER,
  USER_STORAGE_BUCKET,
  listBucketPrefix
} from '@/lib/storage'
import UserImagePicker from '@/components/UserImagePicker'
import { processUserImageInput } from '@/lib/userImages'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditUsuarioPage ({ params }: Props) {
  const { id } = await params

  const supabase = await createSupabaseServer()
  const { data: usuario } = await supabase
    .from('users')
    .select('uid,image,image_bucket,name,surname,email,phone,dni,role')
    .eq('uid', id)
    .single()

  if (!usuario) redirect('/admin/usuarios')

  const defaultImages = await listBucketPrefix(
    supabaseAdmin,
    USER_STORAGE_BUCKET,
    USER_DEFAULTS_FOLDER
  )

  const defaultSelection =
    usuario.image_bucket === USER_STORAGE_BUCKET &&
    typeof usuario.image === 'string' &&
    usuario.image.startsWith(`${USER_DEFAULTS_FOLDER}/`)
      ? usuario.image
      : ''

  async function updateUsuario (formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const payload = {
      name: String(formData.get('name') || ''),
      surname: String(formData.get('surname') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      dni: String(formData.get('dni') || ''),
      role: String(formData.get('role') || 'citizen')
    }
    const password = (formData.get('password') as string) || ''

    const imageResult = await processUserImageInput({
      formData,
      supabase: supabaseAdmin,
      userUid: id,
      currentImage: usuario.image ?? null,
      currentBucket: usuario.image_bucket ?? null
    })

    const imageBucket = imageResult.image_bucket
    const imagePath = imageResult.image

    await supabaseAdmin.auth.admin.updateUserById(id, {
      email: payload.email,
      password: password || undefined,
      user_metadata: {
        name: payload.name,
        surname: payload.surname,
        dni: payload.dni,
        phone: payload.phone,
        image: imagePath,
        image_bucket: imageBucket
      },
      app_metadata: { role: payload.role }
    })

    await supabase.from('users').update({
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      phone: payload.phone,
      dni: payload.dni,
      image: imagePath,
      image_bucket: imageBucket,
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

      <form
        action={updateUsuario}
        className="space-y-3 bg-gray-800 p-4 rounded text-sm"
      >
        <input name="name" defaultValue={usuario.name} className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <input name="surname" defaultValue={usuario.surname} className="w-full p-2 rounded bg-gray-700" placeholder="Apellido" required />
        <input name="email" defaultValue={usuario.email} className="w-full p-2 rounded bg-gray-700" placeholder="Email" required />
        <input name="phone" defaultValue={usuario.phone} className="w-full p-2 rounded bg-gray-700" placeholder="Teléfono" required />
        <input name="dni" defaultValue={usuario.dni} className="w-full p-2 rounded bg-gray-700" placeholder="DNI" required />
        <div className="space-y-2 text-xs text-gray-300">
          <p className="break-all">
            Actual: {usuario.image_bucket ? `${usuario.image_bucket}/${usuario.image ?? ''}` : 'Sin imagen'}
          </p>
          <UserImagePicker
            defaultImages={defaultImages}
            initialImage={usuario.image}
            initialBucket={usuario.image_bucket}
            initialDefault={defaultSelection}
          />
        </div>
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