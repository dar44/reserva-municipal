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
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditUsuarioPage({ params }: Props) {
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

  async function updateUsuario(formData: FormData) {
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

    if (!usuario) {
      throw new Error('Usuario not found')
    }
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
    <div className="container-padding section-spacing max-w-3xl mx-auto">
      <Link href={`/admin/usuarios/${id}`} className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Volver al Detalle
      </Link>

      <h1 className="mb-8">Editar Usuario</h1>

      <form
        action={updateUsuario}
        className="surface p-6 rounded-lg space-y-5"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input name="name" defaultValue={usuario.name} className="input-base w-full" placeholder="Nombre" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Apellido</label>
            <input name="surname" defaultValue={usuario.surname} className="input-base w-full" placeholder="Apellido" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input name="email" defaultValue={usuario.email} className="input-base w-full" placeholder="Email" type="email" required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input name="phone" defaultValue={usuario.phone} className="input-base w-full" placeholder="Teléfono" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">DNI</label>
            <input name="dni" defaultValue={usuario.dni} className="input-base w-full" placeholder="DNI" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select name="role" defaultValue={usuario.role} className="input-base w-full">
            <option value="citizen">Ciudadano</option>
            <option value="worker">Trabajador</option>
            <option value="organizer">Organizador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nueva contraseña (opcional)</label>
          <input name="password" type="password" className="input-base w-full" placeholder="Dejar en blanco para no cambiar" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Imagen de perfil</label>
          <p className="text-xs text-tertiary break-all">
            Actual: {usuario.image_bucket ? `${usuario.image_bucket}/${usuario.image ?? ''}` : 'Sin imagen'}
          </p>
          <UserImagePicker
            defaultImages={defaultImages}
            initialImage={usuario.image}
            initialBucket={usuario.image_bucket}
            initialDefault={defaultSelection}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Guardar Cambios</Button>
          <Button asChild variant="outline">
            <Link href={`/admin/usuarios/${id}`}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}