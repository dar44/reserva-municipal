import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default function NuevoCursoPage () {
  const crearCurso = async (formData: FormData) => {
    'use server'
    const supabase = await createSupabaseServer()
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      begining_date: formData.get('begining_date') || null,
      end_date: formData.get('end_date') || null,
      price: Number(formData.get('price') || 0),
      state: formData.get('state') as string || 'Disponible',
      capacity: Number(formData.get('capacity') || 0),
      image: formData.get('image') as string || null,
    }
    const { error } = await supabase.from('cursos').insert(data)
    if (error) {
      console.error('Error al crear curso:', error)
      throw new Error(error.message)
    }
    revalidatePath('/admin/cursos')
    redirect('/admin/cursos')
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link href="/admin/cursos" className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Nuevo Curso</h1>
      <form action={crearCurso} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Ubicación"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <input
          type="date"
          name="begining_date"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <input
          type="date"
          name="end_date"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <input
          type="number"
          step="0.1"
          name="price"
          placeholder="Precio"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <select
          name="state"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        >
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <input
          type="number"
          name="capacity"
          placeholder="Capacidad"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <input
          type="text"
          name="image"
          placeholder="URL de la imagen"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Crear</button>
      </form>
    </div>
  )
}