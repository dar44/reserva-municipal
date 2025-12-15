import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'
import RecintoImagePicker from '@/components/RecintoImagePicker'
import { processRecintoImageInput } from '@/lib/recintoImages'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/SubmitButton"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

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
    <div className="container-padding section-spacing max-w-3xl mx-auto">
      <Breadcrumbs
        homeHref="/admin/panel"
        items={[
          { label: 'Recintos', href: '/admin/recintos' },
          { label: recinto.name, href: `/admin/recintos/${id}` },
          { label: 'Editar' }
        ]}
      />

      <h1 className="mb-8">Editar Recinto</h1>

      <form action={updateRecinto} className="surface p-6 rounded-lg space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input name="name" defaultValue={recinto.name} className="input-base w-full" placeholder="Nombre del recinto" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea name="description" defaultValue={recinto.description ?? ''} className="input-base w-full" rows={3} placeholder="Descripción del recinto" />
        </div>

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

        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select name="state" defaultValue={recinto.state} className="input-base w-full">
            <option value="Disponible">Disponible</option>
            <option value="No disponible">No disponible</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>

        <RecintoImagePicker initialImage={recinto.image ?? null} />

        <div className="flex gap-3 pt-4">
          <SubmitButton loadingText="Guardando...">Guardar Cambios</SubmitButton>
          <Button asChild variant="outline">
            <Link href={`/admin/recintos/${id}`}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}