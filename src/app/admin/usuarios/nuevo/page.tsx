import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  USER_DEFAULTS_FOLDER,
  USER_STORAGE_BUCKET,
  listBucketPrefix
} from '@/lib/storage'
import UserImagePicker from '@/components/UserImagePicker'
import { processUserImageInput } from '@/lib/userImages'
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function NewUsuarioPage() {
  const defaultImages = await listBucketPrefix(
    supabaseAdmin,
    USER_STORAGE_BUCKET,
    USER_DEFAULTS_FOLDER
  )

  async function createUsuario(formData: FormData) {
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
      const imageResult = await processUserImageInput({
        formData,
        supabase: supabaseAdmin,
        userUid: createdUser.id,
        currentImage: null,
        currentBucket: null
      })

      imageBucket = imageResult.image_bucket
      imagePath = imageResult.image

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
    <div className="container-padding section-spacing max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/usuarios" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Volver a Usuarios
        </Link>
        <h1>Nuevo Usuario</h1>
      </div>

      <form action={createUsuario} className="space-y-6 surface p-6 rounded-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input name="name" className="input-base w-full" placeholder="Nombre" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Apellido</label>
            <input name="surname" className="input-base w-full" placeholder="Apellido" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input name="email" type="email" className="input-base w-full" placeholder="usuario@ejemplo.com" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input name="password" type="password" className="input-base w-full" placeholder="••••••••" required />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input name="phone" className="input-base w-full" placeholder="+34 600 000 000" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">DNI</label>
            <input name="dni" className="input-base w-full" placeholder="12345678A" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select name="role" className="input-base w-full">
            <option value="citizen">Ciudadano</option>
            <option value="worker">Trabajador Municipal</option>
            <option value="organizer">Organizador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <UserImagePicker
          defaultImages={defaultImages}
          helpText="Si no subes ninguna imagen se mostrará una imagen por defecto."
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit">Crear Usuario</Button>
          <Button asChild variant="outline">
            <Link href="/admin/usuarios">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}