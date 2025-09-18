import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'

export const dynamic = 'force-dynamic'

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  const supabase = await createSupabaseServer()
  const { data: curso, error: fetchError } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) console.error('FETCH curso error:', fetchError)
  if (!curso) return notFound()

  const actualizarCurso = async (formData: FormData) => {
    'use server'
    try {
      const supabase = await createSupabaseServer()

      const begining_date = (formData.get('begining_date') as string) || null
      const end_date      = (formData.get('end_date') as string) || null
      const imageRaw      = (formData.get('image') as string) || ''
      const image         = imageRaw.trim() === '' ? null : imageRaw

      const data = {
        name:        String(formData.get('name') || ''),
        description: ((formData.get('description') as string) || '').trim() || null,
        location:    ((formData.get('location') as string) || '').trim() || null,
        begining_date,
        end_date,
        price:       Number(formData.get('price') || 0),
        state:       String(formData.get('state') || 'Disponible'),
        capacity:    Number(formData.get('capacity') || 0),
        image,
        updated_at:  new Date().toISOString(),
      }

      const { error } = await supabase
        .from('cursos')
        .update(data)
        .eq('id', id)

      if (error) {
        console.error('UPDATE cursos error:', error)
        throw new Error(error.message)
      }

      revalidatePath(`/admin/cursos/${id}`)
      revalidatePath('/admin/cursos')
      redirect(`/admin/cursos/${id}`)
    } catch (e: unknown) {
      if ((e as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
    // Es un redirect, lo ignoramos
        throw e
    }
    console.error('ServerAction actualizarCurso error:', e)
    throw e
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link href={`/admin/cursos/${id}`} className="text-sm underline">← Volver</Link>
      <h1 className="text-2xl font-bold">Editar Curso</h1>

      <form action={actualizarCurso} className="space-y-3">
        <input
          type="text"
          name="name"
          defaultValue={curso.name}
          placeholder="Nombre"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
          required
        />

        <textarea
          name="description"
          defaultValue={curso.description ?? ''}
          placeholder="Descripción"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

       <LocationPicker
          valueNames={{
            address: 'location',
            postalCode: 'postal_code',
            city: 'city',
            province: 'province',
            region: 'community',
          }}
          labels={{ region: 'Comunidad' }}
          defaultValues={{
            address: curso.location ?? undefined,
          }}
        />

        <input
          type="date"
          name="begining_date"
          defaultValue={curso.begining_date ? new Date(curso.begining_date).toISOString().split('T')[0] : ''}
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

        <input
          type="date"
          name="end_date"
          defaultValue={curso.end_date ? new Date(curso.end_date).toISOString().split('T')[0] : ''}
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

        <input
          type="number"
          step="0.01"
          name="price"
          defaultValue={curso.price ?? 0}
          placeholder="Precio"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

        <select
          name="state"
          defaultValue={curso.state}
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        >
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <input
          type="number"
          name="capacity"
          defaultValue={curso.capacity ?? 0}
          placeholder="Capacidad"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

        <input
          type="text"
          name="image"
          defaultValue={curso.image ?? ''}
          placeholder="URL de la imagen"
          className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
        />

        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Guardar</button>
      </form>
    </div>
  )
}
