'use client'

import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

type OrganizerCourse = {
  id: number
  name: string
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
      } else {
        toast.success('Solicitud creada correctamente')
        form.reset()
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
          <form onSubmit={handleReservationSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Curso
                <select
                  name="curso_id"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                Recinto
                <select
                  name="recinto_id"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                >
                  <option value="">Selecciona un recinto</option>
                  {availableRecintos.map(recinto => (
                    <option key={recinto.id} value={recinto.id}>{recinto.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Fecha de inicio
                <input
                  type="date"
                  name="start_date"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                />
              </label>

              <label className="text-sm">
                Fecha de término
                <input
                  type="date"
                  name="end_date"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Hora de inicio
                <input
                  type="time"
                  name="start_time"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                />
              </label>

              <label className="text-sm">
                Hora de término
                <input
                  type="time"
                  name="end_time"
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                  required
                />
              </label>
            </div>

            <fieldset className="text-sm">
              <legend className="font-medium text-gray-200">Días de la semana</legend>
              <p className="text-xs text-gray-400">Selecciona los días en los que se debe reservar el recinto.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAY_OPTIONS.map(day => (
                  <label
                    key={day.value}
                    className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs uppercase tracking-wide"
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

            <label className="block text-sm">
              Observaciones
              <textarea
                name="observations"
                className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                rows={3}
                placeholder="Información adicional para el trabajador municipal (opcional)"
              />
            </label>

            <div>
              <button
                type="submit"
                className="w-full rounded bg-emerald-600 py-2 text-white transition hover:bg-emerald-500 md:w-auto md:px-4"
                disabled={submittingReservation}
              >
                {submittingReservation ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Historial de solicitudes</h2>
          <p className="text-sm text-gray-400">Consulta el estado de tus peticiones de reserva.</p>
        </div>

        {reservationList.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no has enviado solicitudes de reserva.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded bg-gray-900 text-sm">
              <thead className="bg-gray-800 text-xs uppercase text-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left">Curso</th>
                  <th className="px-4 py-2 text-left">Recinto</th>
                  <th className="px-4 py-2 text-left">Inicio</th>
                  <th className="px-4 py-2 text-left">Fin</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {reservationList.map(reservation => (
                  <tr key={reservation.id} className="border-t border-gray-800">
                    <td className="px-4 py-2">{courseNameById.get(reservation.curso_id) ?? `Curso #${reservation.curso_id}`}</td>
                    <td className="px-4 py-2">{recintoNameById.get(reservation.recinto_id) ?? `Recinto #${reservation.recinto_id}`}</td>
                    <td className="px-4 py-2">{formatDateTime(reservation.start_at)}</td>
                    <td className="px-4 py-2">{formatDateTime(reservation.end_at)}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded px-2 py-0.5 text-xs uppercase ${reservation.status === 'pendiente'
                          ? 'bg-yellow-600 text-black'
                          : reservation.status === 'aprobada'
                            ? 'bg-green-700 text-white'
                            : reservation.status === 'rechazada'
                              ? 'bg-red-700 text-white'
                              : 'bg-gray-700 text-white'
                        }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-300">
                      {reservation.observations ? reservation.observations : '—'}
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