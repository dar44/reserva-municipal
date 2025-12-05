import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'
import CourseImagePicker from '@/components/CursoImagePicker'
import {
  COURSE_DEFAULTS_FOLDER,
  COURSE_IMAGE_BUCKET,
  processCourseImageInput,
} from '@/lib/cursoImages'
import { listBucketPrefix } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function NuevoCursoPage() {
  const supabase = await createSupabaseServer()
  const defaultImages = await listBucketPrefix(
    supabase,
    COURSE_IMAGE_BUCKET,
    COURSE_DEFAULTS_FOLDER,
  )

  const crearCurso = async (formData: FormData) => {
    'use server'
    const supabase = await createSupabaseServer()

    const begining_date = (formData.get('begining_date') as string) || null
    const end_date = (formData.get('end_date') as string) || null
    const start_time = (formData.get('start_time') as string) || null
    const end_time = (formData.get('end_time') as string) || null

    // Procesar days_of_week de los checkboxes
    const days_of_week: number[] = []
    for (let i = 1; i <= 7; i++) {
      if (formData.get(`day_${i}`) === 'on') {
        days_of_week.push(i)
      }
    }

    const {
      image,
      image_bucket,
      uploadedPath: uploadedImagePath,
    } = await processCourseImageInput({
      supabase,
      formData,
    })

    const data = {
      name: String(formData.get('name') || ''),
      description: ((formData.get('description') as string) || '').trim() || null,
      location: ((formData.get('location') as string) || '').trim() || null,
      begining_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      days_of_week: days_of_week.length > 0 ? days_of_week : null,
      price: Number(formData.get('price') || 0),
      state: (formData.get('state') as string) || 'Disponible',
      capacity: Number(formData.get('capacity') || 0),
      image,
      image_bucket,
    }

    const { data: inserted, error } = await supabase
      .from('cursos')
      .insert(data)
      .select('id')
      .single()

    if (error) {
      if (uploadedImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from('cursos')
          .remove([uploadedImagePath])
        if (cleanupError) {
          console.error('CLEANUP curso image error:', cleanupError)
        }
      }
      console.error('Error al crear curso:', error)
      throw new Error(error.message)
    }

    revalidatePath('/admin/cursos')
    revalidatePath('/cursos')
    revalidatePath('/worker/cursos')
    if (inserted?.id) {
      revalidatePath(`/cursos/${inserted.id}`)
      revalidatePath(`/admin/cursos/${inserted.id}`)
      revalidatePath(`/worker/cursos/${inserted.id}`)
    }

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
        <LocationPicker
          valueNames={{
            address: 'location',
            postalCode: 'postal_code',
            city: 'city',
            province: 'province',
            region: 'community',
          }}
          labels={{ region: 'Comunidad' }}
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Horario del curso</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora de inicio</label>
              <input
                type="time"
                name="start_time"
                className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora de fin</label>
              <input
                type="time"
                name="end_time"
                className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Días de la semana</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 1, label: 'Lun' },
              { value: 2, label: 'Mar' },
              { value: 3, label: 'Mié' },
              { value: 4, label: 'Jue' },
              { value: 5, label: 'Vie' },
              { value: 6, label: 'Sáb' },
              { value: 7, label: 'Dom' },
            ].map(day => (
              <label key={day.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name={`day_${day.value}`}
                  className="h-4 w-4 accent-blue-600"
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>
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
        <CourseImagePicker defaultImages={defaultImages} />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Crear</button>
      </form>
    </div>
  )
}