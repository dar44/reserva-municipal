import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { createSupabaseServer } from '@/lib/supabaseServer'
import LocationPicker from '@/components/LocationPicker'
import CourseImagePicker from '@/components/CursoImagePicker'
import {
  COURSE_DEFAULTS_FOLDER,
  COURSE_IMAGE_BUCKET,
  processCourseImageInput,
} from '@/lib/cursoImages'
import { getPublicStorageUrl, listBucketPrefix } from '@/lib/storage'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/SubmitButton"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

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

  const imageUrl = getPublicStorageUrl(supabase, curso.image, curso.image_bucket)
  const defaultImages = await listBucketPrefix(
    supabase,
    COURSE_IMAGE_BUCKET,
    COURSE_DEFAULTS_FOLDER,
  )

  const actualizarCurso = async (formData: FormData) => {
    'use server'
    try {
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
        previousImageToRemove,
      } = await processCourseImageInput({
        supabase,
        formData,
        currentImage: curso.image,
        currentBucket: curso.image_bucket,
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
        state: String(formData.get('state') || 'Disponible'),
        capacity: Number(formData.get('capacity') || 0),
        image,
        image_bucket,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('cursos')
        .update(data)
        .eq('id', id)

      if (error) {
        if (uploadedImagePath) {
          const { error: cleanupError } = await supabase.storage
            .from('cursos')
            .remove([uploadedImagePath])
          if (cleanupError) {
            console.error('CLEANUP curso image error:', cleanupError)
          }
        }
        console.error('UPDATE cursos error:', error)
        throw new Error(error.message)
      }

      if (previousImageToRemove) {
        const { error: removeError } = await supabase.storage
          .from(previousImageToRemove.bucket)
          .remove([previousImageToRemove.path])
        if (removeError) {
          console.error('REMOVE curso image error:', removeError)
        }
      }

      revalidatePath(`/admin/cursos/${id}`)
      revalidatePath('/admin/cursos')
      revalidatePath('/cursos')
      revalidatePath(`/cursos/${id}`)
      revalidatePath('/worker/cursos')
      revalidatePath(`/worker/cursos/${id}`)
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
    <div className="container-padding section-spacing max-w-3xl mx-auto">
      <Breadcrumbs
        homeHref="/admin/panel"
        items={[
          { label: 'Cursos', href: '/admin/cursos' },
          { label: curso.name, href: `/admin/cursos/${id}` },
          { label: 'Editar' }
        ]}
      />

      <h1 className="mb-8">Editar Curso</h1>

      <form action={actualizarCurso} className="surface p-6 rounded-lg space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del curso</label>
          <input
            type="text"
            name="name"
            defaultValue={curso.name}
            placeholder="Nombre"
            className="input-base w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            name="description"
            defaultValue={curso.description ?? ''}
            placeholder="Descripción"
            rows={3}
            className="input-base w-full"
          />
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
          defaultValues={{
            address: curso.location ?? undefined,
          }}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
            <input
              type="date"
              name="begining_date"
              defaultValue={curso.begining_date ? new Date(curso.begining_date).toISOString().split('T')[0] : ''}
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fecha de fin</label>
            <input
              type="date"
              name="end_date"
              defaultValue={curso.end_date ? new Date(curso.end_date).toISOString().split('T')[0] : ''}
              className="input-base w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Horario del curso</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora de inicio</label>
              <input
                type="time"
                name="start_time"
                defaultValue={curso.start_time || ''}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora de fin</label>
              <input
                type="time"
                name="end_time"
                defaultValue={curso.end_time || ''}
                className="input-base w-full"
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
                  defaultChecked={curso.days_of_week?.includes(day.value)}
                  className="h-4 w-4 accent-blue-600"
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Precio (€)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              defaultValue={curso.price ?? 0}
              placeholder="0.00"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capacidad</label>
            <input
              type="number"
              name="capacity"
              defaultValue={curso.capacity ?? 0}
              placeholder="Número de plazas"
              className="input-base w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select
            name="state"
            defaultValue={curso.state}
            className="input-base w-full"
          >
            <option value="Disponible">Disponible</option>
            <option value="No disponible">No disponible</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Imagen del curso</label>
          <div className="relative h-40 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={curso.name}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 320px, 100vw"
              />
            ) : (
              <span>Sin imagen personalizada</span>
            )}
          </div>
          <CourseImagePicker
            defaultImages={defaultImages}
            initialImage={curso.image}
            initialBucket={curso.image_bucket}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <SubmitButton loadingText="Guardando...">Guardar Cambios</SubmitButton>
          <Button asChild variant="outline">
            <Link href={`/admin/cursos/${id}`}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}