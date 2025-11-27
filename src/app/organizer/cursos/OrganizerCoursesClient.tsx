'use client'

import { useState } from 'react'
import { getConfiguredCurrency } from '@/lib/config'
import { formatCurrency } from '@/lib/currency'
import { useToast } from '@/components/Toast'

type OrganizerCourse = {
  id: number
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  price: number | null
  capacity: number | null
  state: string
}

type Props = {
  courses: OrganizerCourse[]
  
}

type CoursePayload = {
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  price: number | null
  capacity: number | null
}

export default function OrganizerCoursesClient ({ courses }: Props) {
  const [courseList, setCourseList] = useState(courses)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const toast = useToast()
  const currency = getConfiguredCurrency()

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

    const payload: CoursePayload = {
      name: (formData.get('name') as string).trim(),
      description: ((formData.get('description') as string) || '').trim() || null,
      location: ((formData.get('location') as string) || '').trim() || null,
      begining_date: (formData.get('begining_date') as string) || null,
      end_date: (formData.get('end_date') as string) || null,
      price: formData.get('price') ? Number(formData.get('price')) : null,
      capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    }

    if (!payload.name) {
      toast({ type: 'error', message: 'El nombre del curso es obligatorio' })
      return
    }

    setCreatingCourse(true)
    try {
      const response = await fetch('/api/organizer/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast({ type: 'error', message: data.error || 'No se pudo crear el curso' })
        return
      }

      if (data.curso) {
        setCourseList(prev => [data.curso, ...prev])
        toast({ type: 'success', message: 'Curso creado correctamente' })
        form.reset()
      }
    } catch (error) {
      console.error('Error creating course', error)
      toast({ type: 'error', message: 'Error al crear el curso' })
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

    const payload: CoursePayload & { state: string } = {
      name: (formData.get('name') as string).trim(),
      description: ((formData.get('description') as string) || '').trim() || null,
      location: ((formData.get('location') as string) || '').trim() || null,
      begining_date: (formData.get('begining_date') as string) || null,
      end_date: (formData.get('end_date') as string) || null,
      price: formData.get('price') ? Number(formData.get('price')) : null,
      capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
      state: (formData.get('state') as string) || 'Disponible',
    }

    if (!payload.name) {
      toast({ type: 'error', message: 'El nombre del curso es obligatorio' })
      return
    }

    try {
      const response = await fetch(`/api/organizer/cursos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast({ type: 'error', message: data.error || 'No se pudo actualizar el curso' })
        return
      }

      if (data.curso) {
        setCourseList(prev => prev.map(course => (
          course.id === id ? data.curso : course
        )))
        toast({ type: 'success', message: 'Curso actualizado correctamente' })
        setEditingCourseId(null)
      }
    } catch (error) {
      console.error('Error updating course', error)
      toast({ type: 'error', message: 'Error al actualizar el curso' })
    }
  }

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return

    try {
      const response = await fetch(`/api/organizer/cursos/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast({ type: 'error', message: data.error || 'No se pudo eliminar el curso' })
        return
      }

      setCourseList(prev => prev.filter(course => course.id !== id))
      toast({ type: 'success', message: 'Curso eliminado correctamente' })
    } catch (error) {
      console.error('Error deleting course', error)
      toast({ type: 'error', message: 'Error al eliminar el curso' })
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold">Gestión de cursos</h1>
          <p className="text-sm text-gray-400">Crea nuevos programas/cursos y administra los ya publicados.</p>
        </header>

        <article className="rounded border border-emerald-500 bg-emerald-50/80 p-4 text-sm text-emerald-900">
           <p>Completa los datos del curso y publícalo en el catálogo municipal al instante.</p>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Crear un nuevo curso</h2>
          <p className="text-sm text-gray-400">Completa la información básica del curso y publícalo al instante.</p>
        </div>

        <form onSubmit={handleCreateCourse} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2">
            Nombre
            <input
              type="text"
              name="name"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
              required
            />
          </label>

          <label className="text-sm md:col-span-2">
            Descripción
            <textarea
              name="description"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
              rows={3}
            />
          </label>

          <label className="text-sm md:col-span-2">
            Ubicación
            <input
              type="text"
              name="location"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
              placeholder="Dirección o ciudad"
            />
          </label>

          <label className="text-sm">
            Fecha de inicio
            <input
              type="date"
              name="begining_date"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
            />
          </label>

          <label className="text-sm">
            Fecha de fin
            <input
              type="date"
              name="end_date"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
            />
          </label>

          <label className="text-sm">
            Precio (CLP)
            <input
              type="number"
              step="0.01"
              name="price"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
            />
          </label>

          <label className="text-sm">
            Capacidad
            <input
              type="number"
              name="capacity"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded bg-emerald-600 py-2 text-white transition hover:bg-emerald-500 md:w-auto md:px-4"
              disabled={creatingCourse}
            >
              {creatingCourse ? 'Creando…' : 'Crear curso'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Tus cursos</h2>
          <p className="text-sm text-gray-400">Edita o elimina los cursos publicados.</p>
        </div>

        {courseList.length === 0 ? (
          <p className="text-sm text-gray-400">Aún no has creado cursos. ¡Comienza creando uno desde el formulario anterior!</p>
        ) : (
          <ul className="space-y-4">
            {courseList.map(course => (
              <li key={course.id} className="rounded border border-gray-700 bg-gray-900 p-4">
                {editingCourseId === course.id ? (
                  <form onSubmit={event => handleUpdateCourse(event, course.id)} className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm md:col-span-2">
                      Nombre
                      <input
                        type="text"
                        name="name"
                        defaultValue={course.name}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                        required
                      />
                    </label>
                    <label className="text-sm md:col-span-2">
                      Descripción
                      <textarea
                        name="description"
                        defaultValue={course.description ?? ''}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                        rows={3}
                      />
                    </label>
                    <label className="text-sm md:col-span-2">
                      Ubicación
                      <input
                        type="text"
                        name="location"
                        defaultValue={course.location ?? ''}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      />
                    </label>
                    <label className="text-sm">
                      Fecha de inicio
                      <input
                        type="date"
                        name="begining_date"
                        defaultValue={course.begining_date ? course.begining_date.slice(0, 10) : ''}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      />
                    </label>
                    <label className="text-sm">
                      Fecha de fin
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={course.end_date ? course.end_date.slice(0, 10) : ''}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      />
                    </label>
                    <label className="text-sm">
                      Precio (CLP)
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        defaultValue={course.price ?? undefined}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      />
                    </label>
                    <label className="text-sm">
                      Capacidad
                      <input
                        type="number"
                        name="capacity"
                        defaultValue={course.capacity ?? undefined}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      />
                    </label>
                    <label className="text-sm">
                      Estado
                      <select
                        name="state"
                        defaultValue={course.state}
                        className="mt-1 w-full rounded border border-gray-700 bg-gray-950 p-2"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="No disponible">No disponible</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm">Guardar cambios</button>
                      <button
                        type="button"
                        onClick={() => setEditingCourseId(null)}
                        className="rounded bg-gray-700 px-3 py-1 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <p className="text-sm text-gray-400">{course.location ?? 'Ubicación no especificada'}</p>
                      </div>
                      <span className={`self-start rounded px-2 py-0.5 text-xs uppercase ${
                        course.state === 'Disponible'
                          ? 'bg-green-700 text-white'
                          : course.state === 'No disponible'
                            ? 'bg-yellow-700 text-white'
                            : 'bg-red-700 text-white'
                      }`}>
                        {course.state}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{course.description ?? 'Sin descripción'}</p>
                    <dl className="grid grid-cols-2 gap-2 text-xs text-gray-400 md:grid-cols-4">
                      <div>
                        <dt className="uppercase tracking-wide">Inicio</dt>
                        <dd>{formatDate(course.begining_date)}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Fin</dt>
                        <dd>{formatDate(course.end_date)}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Precio</dt>
                        <dd>{course.price != null ? formatCurrency(Number(course.price), currency) : '—'}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Capacidad</dt>
                        <dd>{course.capacity ?? '—'}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCourseId(course.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}