import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  USER_DEFAULTS_FOLDER,
  USER_STORAGE_BUCKET,
  buildUserProfilePath,
  listBucketPrefix
} from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function NewUsuarioPage () {
  const defaultImages = await listBucketPrefix(
    supabaseAdmin,
    USER_STORAGE_BUCKET,
    USER_DEFAULTS_FOLDER
  )

  async function createUsuario (formData: FormData) {
    'use server'
    const data = {
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      dni: formData.get('dni') as string,
      role: formData.get('role') as string
    }

    const imageFile = formData.get('imageFile') as File | null
    const defaultImage = (formData.get('imageDefault') as string) || ''

    const { data: created } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        surname: data.surname,
        dni: data.dni,
        phone: data.phone
      },
      app_metadata: { role: data.role }
    })

    const createdUser = created?.user

    let imageBucket: string | null = null
    let imagePath: string | null = null

    if (createdUser) {
      if (imageFile && imageFile.size > 0) {
        const uploadPath = buildUserProfilePath(createdUser.id, imageFile.name)
        const { error: uploadError } = await supabaseAdmin.storage
          .from(USER_STORAGE_BUCKET)
          .upload(uploadPath, imageFile, {
            cacheControl: '3600',
            upsert: true
          })
        if (!uploadError) {
          imageBucket = USER_STORAGE_BUCKET
          imagePath = uploadPath
        }
      } else if (defaultImage) {
        imageBucket = USER_STORAGE_BUCKET
        imagePath = defaultImage
      }

      await supabaseAdmin.auth.admin.updateUserById(createdUser.id, {
        user_metadata: {
          name: data.name,
          surname: data.surname,
          dni: data.dni,
          phone: data.phone,
          image: imagePath,
          image_bucket: imageBucket
        },
        app_metadata: { role: data.role }
      })

      await supabaseAdmin
        .from('users')
        .update({
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          dni: data.dni,
          image: imagePath,
          image_bucket: imageBucket,
          role: data.role,
          updated_at: new Date().toISOString()
        })
        .eq('uid', createdUser.id)
    }

    revalidatePath('/admin/usuarios')
    redirect('/admin/usuarios')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
      <form
        action={createUsuario}
        className="space-y-3 bg-gray-800 p-4 rounded text-sm"
      >
        <input name="name" className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <input name="surname" className="w-full p-2 rounded bg-gray-700" placeholder="Apellido" required />
        <input name="email" type="email" className="w-full p-2 rounded bg-gray-700" placeholder="Email" required />
        <input name="password" type="password" className="w-full p-2 rounded bg-gray-700" placeholder="Password" required />
        <input name="phone" className="w-full p-2 rounded bg-gray-700" placeholder="Teléfono" required />
        <input name="dni" className="w-full p-2 rounded bg-gray-700" placeholder="DNI" required />
        <input name="imageFile" type="file" accept="image/*" className="w-full text-xs" />
        <select name="imageDefault" className="w-full p-2 rounded bg-gray-700 text-xs">
          <option value="">Seleccionar imagen predeterminada</option>
          {defaultImages.map(option => (
            <option key={option.path} value={option.path}>
              {option.name}
            </option>
          ))}
        </select>
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