import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'
import RecintoImagePicker from '@/components/RecintoImagePicker'
import { revalidatePath } from 'next/cache'
import { processRecintoImageInput } from '@/lib/recintoImages'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/SubmitButton"

export const dynamic = 'force-dynamic'

export default async function NewRecintoPage() {
  async function createRecinto(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const { image, image_bucket } = await processRecintoImageInput({
      formData,
      supabase,
    })
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      ubication: formData.get('ubication') as string,
      province: formData.get('province') as string,
      postal_code: formData.get('postal_code') as string,
      state: formData.get('state') as string,
      image,
      image_bucket,
    }
    const { error } = await supabase.from('recintos').insert(data)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/recintos')
    revalidatePath('/worker/recintos')
    revalidatePath('/recintos')
    redirect('/admin/recintos')
  }

  return (
    <div className="container-padding section-spacing max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/recintos" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Volver a Recintos
        </Link>
        <h1>Nuevo Recinto</h1>
      </div>

      <form action={createRecinto} className="space-y-6 surface p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input name="name" className="input-base w-full" placeholder="Nombre del recinto" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea name="description" className="input-base w-full min-h-[100px]" placeholder="Descripción del recinto" required />
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
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select name="state" className="input-base w-full">
            <option value="Disponible">Disponible</option>
            <option value="No disponible">No disponible</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>

        <RecintoImagePicker />

        <div className="flex gap-3 pt-4">
          <SubmitButton loadingText="Creando...">Crear Recinto</SubmitButton>
          <Button asChild variant="outline">
            <Link href="/admin/recintos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}