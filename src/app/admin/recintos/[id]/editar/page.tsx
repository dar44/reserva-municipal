import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditRecintoPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  const supabase = await createSupabaseServer()
  const { data: recinto } = await supabase
    .from('recintos')
    .select('id,name,description,ubication,province,postal_code,state,image')
    .eq('id', id)
    .single()

  if (!recinto) redirect('/admin/recintos')

  async function updateRecinto(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const payload = {
      name: String(formData.get('name') || ''),
      description: ((formData.get('description') as string) || '').trim() || null,
      ubication: ((formData.get('ubication') as string) || '').trim() || null,
      province: ((formData.get('province') as string) || '').trim() || null,
      postal_code: ((formData.get('postal_code') as string) || '').trim() || null,
      image: ((formData.get('image') as string) || '').trim() || null,
      state: String(formData.get('state') || 'Disponible'),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('recintos').update(payload).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath(`/admin/recintos/${id}`)
    revalidatePath('/admin/recintos')
    redirect(`/admin/recintos/${id}`)
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/recintos/${id}`} className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Editar Recinto</h1>

      <form action={updateRecinto} className="space-y-3 bg-gray-800 p-4 rounded text-sm">
        <input name="name" defaultValue={recinto.name} className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <textarea name="description" defaultValue={recinto.description ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="Descripción" />
        <input name="ubication" defaultValue={recinto.ubication ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="Ubicación" />
        <input name="province" defaultValue={recinto.province ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="Provincia" />
        <input name="postal_code" defaultValue={recinto.postal_code ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="Código Postal" />
        <input name="image" defaultValue={recinto.image ?? ''} className="w-full p-2 rounded bg-gray-700" placeholder="URL de imagen" />
        <select name="state" defaultValue={recinto.state} className="w-full p-2 rounded bg-gray-700">
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
        <div className="space-x-2">
          <button type="submit" className="bg-blue-600 px-3 py-1 rounded">Guardar</button>
          <Link href={`/admin/recintos/${id}`} className="text-gray-300">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
