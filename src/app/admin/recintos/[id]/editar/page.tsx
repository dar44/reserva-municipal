import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'
import RecintoImagePicker from '@/components/RecintoImagePicker'
import { processRecintoImageInput } from '@/lib/recintoImages'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditRecintoPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  const supabase = await createSupabaseServer()
  const { data: recinto } = await supabase
    .from('recintos')
    .select('id,name,description,ubication,province,postal_code,state,image,image_bucket')
    .eq('id', id)
    .single()

  if (!recinto) redirect('/admin/recintos')

  async function updateRecinto(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const { image, image_bucket } = await processRecintoImageInput({
      formData,
      supabase,
      currentImage: recinto!.image,
      currentBucket: recinto!.image_bucket,
    })

    const payload = {
      name: String(formData.get('name') || ''),
      description: ((formData.get('description') as string) || '').trim() || null,
      ubication: ((formData.get('ubication') as string) || '').trim() || null,
      province: ((formData.get('province') as string) || '').trim() || null,
      postal_code: ((formData.get('postal_code') as string) || '').trim() || null,
      state: String(formData.get('state') || 'Disponible'),
      updated_at: new Date().toISOString(),
      image,
      image_bucket,
    }

    const { error } = await supabase.from('recintos').update(payload).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath(`/admin/recintos/${id}`)
    revalidatePath('/admin/recintos')
    revalidatePath('/worker/recintos')
    revalidatePath('/recintos')
    revalidatePath(`/recintos/${id}`)
    redirect(`/admin/recintos/${id}`)
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/recintos/${id}`} className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Editar Recinto</h1>

      <form action={updateRecinto} className="space-y-3 bg-gray-800 p-4 rounded text-sm">
        <input name="name" defaultValue={recinto.name} className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <textarea name="description" defaultValue={recinto.description ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="Descripción" />
        <LocationPicker
          valueNames={{
            address: 'ubication',
            postalCode: 'postal_code',
            city: 'city',
            province: 'province',
            region: 'community',
          }}
          labels={{ region: 'Comunidad' }}
          defaultValues={{
            address: recinto.ubication ?? undefined,
            postalCode: recinto.postal_code ?? undefined,
            province: recinto.province ?? undefined,
          }}
          required
        />
        <select name="state" defaultValue={recinto.state} className="w-full p-2 rounded bg-gray-700">
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
        <RecintoImagePicker initialImage={recinto.image ?? null} />
        <div className="space-x-2">
          <button type="submit" className="bg-blue-600 px-3 py-1 rounded">Guardar</button>
          <Link href={`/admin/recintos/${id}`} className="text-gray-300">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}