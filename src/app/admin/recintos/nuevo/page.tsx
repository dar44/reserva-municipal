import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function NewRecintoPage () {
  async function createRecinto (formData: FormData) {
    'use server'
    const supabase = await createSupabaseServer()
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      ubication: formData.get('ubication') as string,
      province: formData.get('province') as string,
      postal_code: formData.get('postal_code') as string,
      state: formData.get('state') as string
    }
    await supabase.from('recintos').insert(data)
    revalidatePath('/admin/recintos')
    redirect('/admin/recintos')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuevo Recinto</h1>
      <form action={createRecinto} className="space-y-3 bg-gray-800 p-4 rounded text-sm">
        <input name="name" className="w-full p-2 rounded bg-gray-700" placeholder="Nombre" required />
        <textarea name="description" className="w-full p-2 rounded bg-gray-700" placeholder="Descripción" required />
        <input name="ubication" className="w-full p-2 rounded bg-gray-700" placeholder="Ubicación" required />
        <input name="province" className="w-full p-2 rounded bg-gray-700" placeholder="Provincia" required />
        <input name="postal_code" className="w-full p-2 rounded bg-gray-700" placeholder="Código Postal" required />
        <select name="state" className="w-full p-2 rounded bg-gray-700">
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
        <div className="space-x-2">
          <button type="submit" className="bg-blue-600 px-3 py-1 rounded">Crear</button>
          <Link href="/admin/recintos" className="text-gray-300">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}