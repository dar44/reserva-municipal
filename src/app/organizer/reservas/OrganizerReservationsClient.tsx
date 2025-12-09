'use client'

import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

type OrganizerCourse = {
  id: number
  name: string
  begining_date: string | null
  end_date: string | null
  start_time: string | null
  end_time: string | null
  days_of_week: number[] | null
}

type OrganizerRecinto = {
  id: number
  name: string
  state: string
}

type OrganizerReservation = {
  id: number
  curso_id: number
  recinto_id: number
  start_at: string
  end_at: string
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
  observations: string | null
}

type Props = {
  courses: OrganizerCourse[]
  recintos: OrganizerRecinto[]
  reservations: OrganizerReservation[]
}

const DAY_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export default function OrganizerReservationsClient({ courses, recintos, reservations }: Props) {
  const [reservationList, setReservationList] = useState(reservations)
  const [submittingReservation, setSubmittingReservation] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<OrganizerCourse | null>(null)
  const availableRecintos = useMemo(
    () => recintos.filter(r => r.state === 'Disponible'),
    [recintos],
  )

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>()
    courses.forEach(course => {
      map.set(course.id, course.name)
    })
    return map
  }, [courses])

  const recintoNameById = useMemo(() => {
    const map = new Map<number, string>()
    recintos.forEach(recinto => {
      map.set(recinto.id, recinto.name)
    })
    return map
  }, [recintos])

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }

  const parseTime = (value: string) => {
    const [hoursStr, minutesStr] = value.split(':')
    const hours = Number(hoursStr)
    const minutes = Number(minutesStr)
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
    return { hours, minutes }
  }

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cursoId = Number(event.target.value)
    if (!cursoId) {
      setSelectedCourse(null)
      return
    }

    const course = courses.find(c => c.id === cursoId)
    if (!course) {
      setSelectedCourse(null)
      return
    }

    setSelectedCourse(course)

    // Auto-fill form fields
    const form = event.target.form
    if (!form) return

    // Fill dates
    if (course.begining_date) {
      const startDateInput = form.elements.namedItem('start_date') as HTMLInputElement
      if (startDateInput) {
        startDateInput.value = course.begining_date.slice(0, 10)
      }
    }
    if (course.end_date) {
      const endDateInput = form.elements.namedItem('end_date') as HTMLInputElement
      if (endDateInput) {
        endDateInput.value = course.end_date.slice(0, 10)
      }
    }

    // Fill times
    if (course.start_time) {
      const startTimeInput = form.elements.namedItem('start_time') as HTMLInputElement
      if (startTimeInput) {
        startTimeInput.value = course.start_time.slice(0, 5)
      }
    }
    if (course.end_time) {
      const endTimeInput = form.elements.namedItem('end_time') as HTMLInputElement
      if (endTimeInput) {
        endTimeInput.value = course.end_time.slice(0, 5)
      }
    }

    // Fill days of week
    if (course.days_of_week && course.days_of_week.length > 0) {
      DAY_OPTIONS.forEach(day => {
        const checkbox = form.elements.namedItem('days_of_week') as RadioNodeList
        if (checkbox) {
          Array.from(checkbox).forEach((input: any) => {
            if (Number(input.value) === day.value) {
              input.checked = course.days_of_week?.includes(day.value) || false
            }
          })
        }
      })
    }
  }

  const handleReservationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingReservation) return

    const form = event.currentTarget
    const formData = new FormData(form)

    const cursoId = Number(formData.get('curso_id'))
    const recintoId = Number(formData.get('recinto_id'))
    const startDateRaw = formData.get('start_date') as string | null
    const endDateRaw = formData.get('end_date') as string | null
    const startTimeRaw = formData.get('start_time') as string | null
    const endTimeRaw = formData.get('end_time') as string | null
    const daysSelected = formData.getAll('days_of_week') as string[]
    const observationsRaw = (formData.get('observations') as string) || ''

    if (!cursoId || !recintoId || !startDateRaw || !endDateRaw || !startTimeRaw || !endTimeRaw) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    if (daysSelected.length === 0) {
      toast.error('Selecciona al menos un día de la semana')
      return
    }

    const startDate = new Date(`${startDateRaw}T00:00:00`)
    const endDate = new Date(`${endDateRaw}T00:00:00`)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error('Las fechas seleccionadas no son válidas')
      return
    }

    if (endDate < startDate) {
      toast.error('La fecha de término debe ser posterior a la fecha de inicio')
      return
    }

    const parsedStartTime = startTimeRaw ? parseTime(startTimeRaw) : null
    const parsedEndTime = endTimeRaw ? parseTime(endTimeRaw) : null

    if (!parsedStartTime || !parsedEndTime) {
      toast.error('Las horas seleccionadas no son válidas')
      return
    }

    const startMinutes = parsedStartTime.hours * 60 + parsedStartTime.minutes
    const endMinutes = parsedEndTime.hours * 60 + parsedEndTime.minutes

    if (endMinutes <= startMinutes) {
      toast.error('La hora de término debe ser posterior a la hora de inicio')
      return
    }

    const daysOfWeek = Array.from(new Set(daysSelected.map(value => Number(value)).filter(value => !Number.isNaN(value))))

    if (daysOfWeek.length === 0) {
      toast.error('Selecciona al menos un día de la semana válido')
      return
    }

    const payload = {
      curso_id: cursoId,
      recinto_id: recintoId,
      start_date: startDateRaw,
      end_date: endDateRaw,
      start_time: startTimeRaw,
      end_time: endTimeRaw,
      days_of_week: daysOfWeek,
      observations: observationsRaw.trim() || null,
    }

    setSubmittingReservation(true)
    try {
      const response = await fetch('/api/organizer/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data?.error || 'Error al crear la solicitud de reserva')
        return
      }

      if (Array.isArray(data.reservas) && data.reservas.length > 0) {
        setReservationList(prev => {
          const next = [...data.reservas, ...prev]
          return next.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
        })
        const count = data.reservas.length
        toast.success(
          count === 1
            ? 'Se generó 1 bloque de reserva'
            : `Se generaron ${count} bloques de reserva`
        )
        form.reset()
        setSelectedCourse(null)
      } else {
        toast.success('Solicitud creada correctamente')
        form.reset()
        setSelectedCourse(null)
      }
    } catch (error) {
      console.error('Error creating reservation request', error)
      toast.error('Error al crear la solicitud de reserva')
    } finally {
      setSubmittingReservation(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold">Solicitudes de reserva</h1>
          <p className="text-sm text-gray-400">Envía nuevas peticiones y consulta el historial de respuestas.</p>
        </header>
        <article className="rounded border border-emerald-500 bg-emerald-50/80 p-4 text-sm text-emerald-900">
          <p>Selecciona un curso, el recinto deseado y programa los días y horarios en los que necesitas usarlo.</p>
          <p className="mt-2">Cada solicitud puede generar varios bloques dentro del rango de fechas indicado.</p>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Recintos disponibles</h2>
          <p className="text-sm text-gray-400">Estos recintos están habilitados para nuevas solicitudes.</p>
        </div>

        {availableRecintos.length === 0 ? (
          <p className="text-sm text-gray-400">No hay recintos con disponibilidad en este momento.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {availableRecintos.map(recinto => (
              <article key={recinto.id} className="rounded border border-gray-700 bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-gray-100">{recinto.name}</h3>
                <p className="mt-1 text-xs text-emerald-400">Disponible para solicitudes</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Nueva solicitud</h2>
          <p className="text-sm text-gray-400">Define el rango de fechas, los días de la semana y la franja horaria que necesitas reservar.</p>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-400">Primero debes crear al menos un curso para poder solicitar un recinto.</p>
        ) : availableRecintos.length === 0 ? (
          <p className="text-sm text-gray-400">No hay recintos disponibles en este momento. Inténtalo más tarde.</p>
        ) : (
          <form onSubmit={handleReservationSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="font-medium text-gray-200">Curso *</span>
                <p className="text-xs text-gray-400 mb-1">Los campos se completarán automáticamente</p>
                <select
                  name="curso_id"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                  onChange={handleCourseChange}
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="font-medium text-gray-200">Recinto *</span>
                <select
                  name="recinto_id"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">Selecciona un recinto</option>
                  {availableRecintos.map(recinto => (
                    <option key={recinto.id} value={recinto.id}>{recinto.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {selectedCourse && (
              <div className="rounded-lg border border-emerald-600 bg-emerald-950/30 p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-300 mb-2">Horario del curso: {selectedCourse.name}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedCourse.begining_date && (
                        <div>
                          <span className="text-gray-400">Fecha inicio:</span>
                          <span className="ml-2 text-gray-200">{new Date(selectedCourse.begining_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {selectedCourse.end_date && (
                        <div>
                          <span className="text-gray-400">Fecha fin:</span>
                          <span className="ml-2 text-gray-200">{new Date(selectedCourse.end_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {selectedCourse.start_time && selectedCourse.end_time && (
                        <div>
                          <span className="text-gray-400">Horario:</span>
                          <span className="ml-2 text-gray-200">{selectedCourse.start_time.slice(0, 5)} - {selectedCourse.end_time.slice(0, 5)}</span>
                        </div>
                      )}
                      {selectedCourse.days_of_week && selectedCourse.days_of_week.length > 0 && (
                        <div>
                          <span className="text-gray-400">Días:</span>
                          <span className="ml-2 text-gray-200">
                            {selectedCourse.days_of_week.map(d => ['L', 'M', 'X', 'J', 'V', 'S', 'D'][d - 1] || 'D').join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 mt-2">✓ Los campos del formulario se han completado automáticamente</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-2">📅 Rango de fechas</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium text-gray-200">Fecha de inicio *</span>
                  <input
                    type="date"
                    name="start_date"
                    className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="font-medium text-gray-200">Fecha de término *</span>
                  <input
                    type="date"
                    name="end_date"
                    className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </label>
              </div>

              <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-2">⏰ Horario</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium text-gray-200">Hora de inicio *</span>
                  <input
                    type="time"
                    name="start_time"
                    className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </label>

                <label className="text-sm">
                  <span className="font-medium text-gray-200">Hora de término *</span>
                  <input
                    type="time"
                    name="end_time"
                    className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </label>
              </div>

              <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-2">📆 Días de la semana</h3>
              <fieldset className="text-sm">
                <p className="text-xs text-gray-400 mb-2">Selecciona los días en los que se debe reservar el recinto.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAY_OPTIONS.map(day => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs uppercase tracking-wide hover:border-emerald-500 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="days_of_week"
                        value={day.value}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-gray-200">Observaciones</span>
              <p className="text-xs text-gray-400 mb-1">Información adicional para el trabajador municipal (opcional)</p>
              <textarea
                name="observations"
                className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                rows={3}
                placeholder="Ej: Necesitamos proyector y sillas adicionales"
              />
            </label>

            <div>
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-3 px-6 font-semibold text-white transition hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed md:w-auto"
                disabled={submittingReservation}
              >
                {submittingReservation ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando…
                  </span>
                ) : (
                  '📤 Enviar solicitud'
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">📋 Historial de solicitudes</h2>
          <p className="text-sm text-gray-400">Consulta el estado de tus peticiones de reserva.</p>
        </div>

        {reservationList.length === 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">Todavía no has enviado solicitudes de reserva.</p>
            <p className="text-sm text-gray-500 mt-2">Crea una nueva solicitud arriba para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full bg-gray-900 text-sm">
              <thead className="bg-gray-800">
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Recinto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reservationList.map((reservation, index) => (
                  <tr
                    key={reservation.id}
                    className={`hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-200">{courseNameById.get(reservation.curso_id) ?? `Curso #${reservation.curso_id}`}</td>
                    <td className="px-4 py-3 text-gray-300">{recintoNameById.get(reservation.recinto_id) ?? `Recinto #${reservation.recinto_id}`}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(reservation.start_at)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(reservation.end_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${reservation.status === 'pendiente'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : reservation.status === 'aprobada'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : reservation.status === 'rechazada'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                        {reservation.status === 'pendiente' && '⏳'}
                        {reservation.status === 'aprobada' && '✓'}
                        {reservation.status === 'rechazada' && '✗'}
                        {reservation.status === 'cancelada' && '⊘'}
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                      {reservation.observations || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}