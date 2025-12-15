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
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/SubmitButton"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Tooltip } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

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
    <div className="container-padding section-spacing max-w-3xl mx-auto">
      <Breadcrumbs
        homeHref="/admin/panel"
        items={[
          { label: 'Cursos', href: '/admin/cursos' },
          { label: 'Nuevo curso' }
        ]}
      />
      <div className="mb-8">
        <h1>Nuevo Curso</h1>
      </div>

      <form action={crearCurso} className="space-y-6 surface p-6 rounded-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              name="name"
              placeholder="Nombre del curso"
              className="input-base w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              name="description"
              placeholder="Descripción del curso"
              className="input-base w-full min-h-[100px]"
            />
          </div>
        </div>

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

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
            <input
              type="date"
              name="begining_date"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fecha de fin</label>
            <input
              type="date"
              name="end_date"
              className="input-base w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Horario del curso</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-secondary mb-2">Hora de inicio</label>
              <input
                type="time"
                name="start_time"
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-2">Hora de fin</label>
              <input
                type="time"
                name="end_time"
                className="input-base w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Días de la semana</label>
          <div className="grid grid-cols-4 gap-3">
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
                  className="h-4 w-4 rounded"
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Precio</label>
            <input
              type="number"
              step="0.1"
              name="price"
              placeholder="0.00"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capacidad</label>
            <input
              type="number"
              name="capacity"
              placeholder="0"
              className="input-base w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select name="state" className="input-base w-full">
            <option value="Disponible">Disponible</option>
            <option value="No disponible">No disponible</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <CourseImagePicker defaultImages={defaultImages} />

        <div className="flex gap-3 pt-4">
          <SubmitButton loadingText="Creando...">Crear Curso</SubmitButton>
          <Button asChild variant="outline">
            <Link href="/admin/cursos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}