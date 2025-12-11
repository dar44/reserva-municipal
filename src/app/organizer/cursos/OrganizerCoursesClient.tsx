'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'react-toastify'
import type { StorageObject } from '@/lib/storage'
import { COURSE_IMAGE_BUCKET } from '@/lib/cursoImages'
import OrganizerCourseImagePicker from '@/components/OrganizerCourseImagePicker'
import LocationPicker from '@/components/LocationPicker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type OrganizerCourse = {
  id: number
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  days_of_week: number[] | null
  price: number | null
  capacity: number | null
  state: string
  image: string | null
  image_bucket: string | null
}

type Props = {
  courses: OrganizerCourse[]
  defaultImages: StorageObject[]
}

type CoursePayload = {
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  days_of_week: number[] | null
  price: number | null
  capacity: number | null
  image: string | null
  image_bucket: string | null
}

export default function OrganizerCoursesClient({ courses, defaultImages }: Props) {
  const [courseList, setCourseList] = useState(courses)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)
  const currency = getConfiguredCurrency()

  // Estado para manejar imágenes en el formulario de creación
  const [createImageData, setCreateImageData] = useState<{
    image: string | null
    bucket: string | null
    file: File | null
  }>({ image: null, bucket: null, file: null })

  // Estado para manejar imágenes en el formulario de edición  
  const [editImageData, setEditImageData] = useState<Record<number, {
    image: string | null
    bucket: string | null
    file: File | null
  }>>({})

  const getImageUrl = (image: string | null, imageBucket: string | null): string | null => {
    if (!image || !imageBucket) return null
    // Construct Supabase public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return null
    return `${supabaseUrl}/storage/v1/object/public/${imageBucket}/${image}`
  }

  const formatDate = (value: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('es-ES')
  }

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (creatingCourse) return

    const form = event.currentTarget
    const formData = new FormData(form)

    // Procesar days_of_week de los checkboxes
    const days_of_week: number[] = []
    for (let i = 1; i <= 7; i++) {
      if (formData.get(`day_${i}`) === 'on') {
        days_of_week.push(i)
      }
    }

    setCreatingCourse(true)
    try {
      // Manejar subida de imagen si hay un archivo
      let imageData = { image: createImageData.image, bucket: createImageData.bucket }
      if (createImageData.file) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', createImageData.file)
        const uploadResponse = await fetch('/api/organizer/cursos/upload-image', {
          method: 'POST',
          body: uploadFormData,
        })
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json().catch(() => ({}))
          toast.error(uploadError?.error || 'Error al subir la imagen')
          return
        }
        const uploadData = await uploadResponse.json()
        imageData = { image: uploadData.image, bucket: uploadData.image_bucket }
      }

      const payload: CoursePayload = {
        name: (formData.get('name') as string).trim(),
        description: ((formData.get('description') as string) || '').trim() || null,
        location: ((formData.get('location') as string) || '').trim() || null,
        begining_date: (formData.get('begining_date') as string) || null,
        end_date: (formData.get('end_date') as string) || null,
        start_time: (formData.get('start_time') as string) || null,
        end_time: (formData.get('end_time') as string) || null,
        days_of_week: days_of_week.length > 0 ? days_of_week : null,
        price: formData.get('price') ? Number(formData.get('price')) : null,
        capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
        image: imageData.image,
        image_bucket: imageData.bucket,
      }

      if (!payload.name) {
        toast.error('El nombre del curso es obligatorio')
        return
      }

      const response = await fetch('/api/organizer/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data?.error || 'Error al crear el curso')
        return
      }

      if (data.curso) {
        setCourseList(prev => [data.curso, ...prev])
        toast.success('Curso creado correctamente')
        form.reset()
        setCreateImageData({ image: null, bucket: null, file: null })
      }
    } catch (error) {
      console.error('Error creating course', error)
      toast.error('Error al crear el curso')
    } finally {
      setCreatingCourse(false)
    }
  }

  const handleUpdateCourse = async (
    event: React.FormEvent<HTMLFormElement>,
    id: number,
  ) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    // Procesar days_of_week de los checkboxes
    const days_of_week: number[] = []
    for (let i = 1; i <= 7; i++) {
      if (formData.get(`day_${i}`) === 'on') {
        days_of_week.push(i)
      }
    }

    try {
      // Manejar subida de imagen si hay un archivo
      let imageData = editImageData[id] || { image: null, bucket: null, file: null }
      if (imageData.file) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageData.file)
        const uploadResponse = await fetch('/api/organizer/cursos/upload-image', {
          method: 'POST',
          body: uploadFormData,
        })
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json().catch(() => ({}))
          toast.error(uploadError?.error || 'Error al subir la imagen')
          return
        }
        const uploadData = await uploadResponse.json()
        imageData = { image: uploadData.image, bucket: uploadData.image_bucket, file: null }
      }

      const payload: CoursePayload & { state: string } = {
        name: (formData.get('name') as string).trim(),
        description: ((formData.get('description') as string) || '').trim() || null,
        location: ((formData.get('location') as string) || '').trim() || null,
        begining_date: (formData.get('begining_date') as string) || null,
        end_date: (formData.get('end_date') as string) || null,
        start_time: (formData.get('start_time') as string) || null,
        end_time: (formData.get('end_time') as string) || null,
        days_of_week: days_of_week.length > 0 ? days_of_week : null,
        price: formData.get('price') ? Number(formData.get('price')) : null,
        capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
        state: (formData.get('state') as string) || 'Disponible',
        image: imageData.image,
        image_bucket: imageData.bucket,
      }

      if (!payload.name) {
        toast.error('El nombre del curso es obligatorio')
        return
      }

      const response = await fetch(`/api/organizer/cursos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(data?.error || 'Error al actualizar el curso')
        return
      }

      if (data.curso) {
        setCourseList(prev => prev.map(course => (
          course.id === id ? data.curso : course
        )))
        toast.success('Curso actualizado correctamente')
        setEditingCourseId(null)
        // Limpiar imageData del curso editado
        setEditImageData(prev => {
          const newData = { ...prev }
          delete newData[id]
          return newData
        })
      }
    } catch (error) {
      console.error('Error updating course', error)
      toast.error('Error al actualizar el curso')
    }
  }

  const handleDeleteCourse = async (id: number) => {
    try {
      const response = await fetch(`/api/organizer/cursos/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(data?.error || 'Error al eliminar el curso')
        return
      }

      setCourseList(prev => prev.filter(course => course.id !== id))
      toast.success('Curso eliminado correctamente')
    } catch (error) {
      console.error('Error deleting course', error)
      toast.error('Error al eliminar el curso')
    } finally {
      setDeletingCourseId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h1 className="text-3xl font-bold">Gestión de cursos</h1>
          <p className="text-secondary mt-1">Crea nuevos programas/cursos y administra los ya publicados.</p>
        </header>

        <article className="rounded-lg border border-success/30 bg-success/5 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-foreground/90 font-medium">Completa los datos del curso y publícalo en el catálogo municipal al instante.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Crear un nuevo curso</h2>
          <p className="text-secondary">Completa la información básica del curso y publícalo al instante.</p>
        </div>

        <form onSubmit={handleCreateCourse} className="surface p-6 rounded-lg border space-y-4">
          <label className="block">
            <span className="text-sm font-medium mb-2 block">Nombre</span>
            <input
              type="text"
              name="name"
              className="input-base w-full"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Descripción</span>
            <textarea
              name="description"
              className="input-base w-full"
              rows={3}
            />
          </label>

          <div className="md:col-span-2">
            <LocationPicker
              valueNames={{
                address: 'location',
                postalCode: 'postal_code_display',
                city: 'city_display',
                province: 'province_display',
                region: 'region_display',
              }}
              labels={{
                address: 'Dirección',
                postalCode: 'Código Postal',
                city: 'Ciudad',
                province: 'Provincia',
                region: 'Comunidad',
              }}
              className="mb-0"
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Fecha de inicio</span>
            <input
              type="date"
              name="begining_date"
              className="input-base w-full"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Fecha de fin</span>
            <input
              type="date"
              name="end_date"
              className="input-base w-full"
            />
          </label>

          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium">Horario del curso</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hora de inicio</label>
                <input
                  type="time"
                  name="start_time"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hora de fin</label>
                <input
                  type="time"
                  name="end_time"
                  className="input-base w-full"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium">Días de la semana</label>
            <p className="text-xs text-secondary">Selecciona los días en los que se imparte el curso.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: 1, label: 'Lunes' },
                { value: 2, label: 'Martes' },
                { value: 3, label: 'Miércoles' },
                { value: 4, label: 'Jueves' },
                { value: 5, label: 'Viernes' },
                { value: 6, label: 'Sábado' },
                { value: 7, label: 'Domingo' },
              ].map(day => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 surface rounded px-3 py-2 text-xs uppercase tracking-wide hover:border-success cursor-pointer transition-colors border"
                >
                  <input
                    type="checkbox"
                    name={`day_${day.value}`}
                    className="h-4 w-4 rounded border-border bg-background text-success focus:ring-success"
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Precio (€)</span>
            <input
              type="number"
              step="0.01"
              name="price"
              className="input-base w-full"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Capacidad</span>
            <input
              type="number"
              name="capacity"
              className="input-base w-full"
            />
          </label>

          <OrganizerCourseImagePicker
            defaultImages={defaultImages}
            onChange={(image, bucket, file) => {
              setCreateImageData({ image, bucket, file })
            }}
          />

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full md:w-auto bg-success hover:bg-success/90"
              disabled={creatingCourse}
            >
              {creatingCourse ? 'Creando…' : 'Crear curso'}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Tus cursos</h2>
          <p className="text-secondary">Edita o elimina los cursos publicados.</p>
        </div>

        {courseList.length === 0 ? (
          <p className="text-secondary">Aún no has creado cursos. ¡Comienza creando uno desde el formulario anterior!</p>
        ) : (
          <ul className="space-y-4">
            {courseList.map(course => (
              <li key={course.id} className="surface rounded-lg border p-6">
                {editingCourseId === course.id ? (
                  <form onSubmit={event => handleUpdateCourse(event, course.id)} className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm md:col-span-2">
                      Nombre
                      <input
                        type="text"
                        name="name"
                        defaultValue={course.name}
                        className="input-base w-full"
                        required
                      />
                    </label>
                    <label className="text-sm md:col-span-2">
                      Descripción
                      <textarea
                        name="description"
                        defaultValue={course.description ?? ''}
                        className="input-base w-full"
                        rows={3}
                      />
                    </label>
                    <div className="md:col-span-2">
                      <LocationPicker
                        valueNames={{
                          address: 'location',
                          postalCode: 'postal_code_display',
                          city: 'city_display',
                          province: 'province_display',
                          region: 'region_display',
                        }}
                        defaultValues={{
                          address: course.location ?? undefined,
                        }}
                        labels={{
                          address: 'Dirección',
                          postalCode: 'Código Postal',
                          city: 'Ciudad',
                          province: 'Provincia',
                          region: 'Comunidad',
                        }}
                        className="mb-0"
                      />
                    </div>
                    <label className="text-sm">
                      Fecha de inicio
                      <input
                        type="date"
                        name="begining_date"
                        defaultValue={course.begining_date ? course.begining_date.slice(0, 10) : ''}
                        className="input-base w-full"
                      />
                    </label>
                    <label className="text-sm">
                      Fecha de fin
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={course.end_date ? course.end_date.slice(0, 10) : ''}
                        className="input-base w-full"
                      />
                    </label>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium">Horario del curso</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Hora de inicio</label>
                          <input
                            type="time"
                            name="start_time"
                            defaultValue={course.start_time || ''}
                            className="input-base w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Hora de fin</label>
                          <input
                            type="time"
                            name="end_time"
                            defaultValue={course.end_time || ''}
                            className="input-base w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium">Días de la semana</label>
                      <p className="text-xs text-gray-400">Selecciona los días en los que se imparte el curso.</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          { value: 1, label: 'Lunes' },
                          { value: 2, label: 'Martes' },
                          { value: 3, label: 'Miércoles' },
                          { value: 4, label: 'Jueves' },
                          { value: 5, label: 'Viernes' },
                          { value: 6, label: 'Sábado' },
                          { value: 7, label: 'Domingo' },
                        ].map(day => (
                          <label
                            key={day.value}
                            className="flex items-center gap-2 surface rounded px-3 py-2 text-xs uppercase tracking-wide hover:border-primary cursor-pointer transition-colors border"
                          >
                            <input
                              type="checkbox"
                              name={`day_${day.value}`}
                              defaultChecked={course.days_of_week?.includes(day.value)}
                              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                            />
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="text-sm">
                      Precio (€)
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        defaultValue={course.price ?? undefined}
                        className="input-base w-full"
                      />
                    </label>
                    <label className="text-sm">
                      Capacidad
                      <input
                        type="number"
                        name="capacity"
                        defaultValue={course.capacity ?? undefined}
                        className="input-base w-full"
                      />
                    </label>

                    <OrganizerCourseImagePicker
                      defaultImages={defaultImages}
                      currentImage={course.image}
                      currentBucket={course.image_bucket}
                      onChange={(image, bucket, file) => {
                        setEditImageData(prev => ({
                          ...prev,
                          [course.id]: { image, bucket, file }
                        }))
                      }}
                    />

                    <label className="text-sm">
                      Estado
                      <select
                        name="state"
                        defaultValue={course.state}
                        className="input-base w-full"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="No disponible">No disponible</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </label>
                    <div className="flex gap-3 md:col-span-2">
                      <Button type="submit">Guardar cambios</Button>
                      <Button
                        type="button"
                        onClick={() => setEditingCourseId(null)}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-100">{course.name}</h3>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {course.location ?? 'Ubicación no especificada'}
                        </p>
                      </div>
                      <Badge
                        className={
                          course.state === 'Disponible'
                            ? 'bg-success text-success-foreground'
                            : course.state === 'No disponible'
                              ? 'bg-warning text-warning-foreground'
                              : 'bg-error text-error-foreground'
                        }
                      >
                        {course.state}
                      </Badge>
                    </div>

                    {course.image && course.image_bucket && (
                      <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                        <Image
                          src={getImageUrl(course.image, course.image_bucket) || ''}
                          alt={course.name}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 640px, 100vw"
                        />
                      </div>
                    )}

                    {course.description && (
                      <p className="text-secondary leading-relaxed">{course.description}</p>
                    )}

                    <div className="surface p-4 rounded-lg border space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-tertiary font-medium uppercase tracking-wider">Inicio</span>
                          <span className="text-foreground font-semibold">{formatDate(course.begining_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-tertiary font-medium uppercase tracking-wider">Fin</span>
                          <span className="text-foreground font-semibold">{formatDate(course.end_date)}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-tertiary font-medium uppercase tracking-wider">Horario</span>
                          <span className="text-foreground font-semibold">
                            {course.start_time && course.end_time
                              ? `${course.start_time.slice(0, 5)}-${course.end_time.slice(0, 5)}`
                              : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-tertiary font-medium uppercase tracking-wider">Días</span>
                          <span className="text-foreground font-semibold">
                            {course.days_of_week && course.days_of_week.length > 0
                              ? course.days_of_week
                                .map(d => ['L', 'M', 'X', 'J', 'V', 'S', 'D'][d - 1])
                                .join(', ')
                              : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-tertiary font-medium uppercase tracking-wider">Precio</span>
                        <span className="text-success font-bold">{course.price != null ? formatCurrency(Number(course.price), currency) : 'Gratis'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-tertiary font-medium uppercase tracking-wider">Capacidad</span>
                        <span className="text-foreground font-semibold">{course.capacity ?? '—'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={() => setEditingCourseId(course.id)}
                        className="inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setDeletingCourseId(course.id)}
                        variant="destructive"
                        className="inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {deletingCourseId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="surface p-6 rounded-lg shadow-xl max-w-md border">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="text-secondary mb-6">
              ¿Estás seguro de que quieres eliminar este curso?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setDeletingCourseId(null)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteCourse(deletingCourseId)}
                variant="destructive"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}