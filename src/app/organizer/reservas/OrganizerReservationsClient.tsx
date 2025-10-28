'use client'

import { useMemo, useState } from 'react'
import { useToast } from '@/components/Toast'

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

export default function OrganizerReservationsClient ({ courses, recintos, reservations }: Props) {
  const [reservationList, setReservationList] = useState(reservations)
  const [submittingReservation, setSubmittingReservation] = useState(false)
  const toast = useToast()

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

  const handleReservationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingReservation) return

    const form = event.currentTarget
    const formData = new FormData(form)

    const cursoId = Number(formData.get('curso_id'))
    const recintoId = Number(formData.get('recinto_id'))
    const startRaw = formData.get('start_at') as string | null
    const endRaw = formData.get('end_at') as string | null
    const observationsRaw = (formData.get('observations') as string) || ''

    if (!cursoId || !recintoId || !startRaw || !endRaw) {
      toast({ type: 'error', message: 'Todos los campos son obligatorios' })
      return
    }

    const startDate = new Date(startRaw)
    const endDate = new Date(endRaw)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast({ type: 'error', message: 'Fechas inválidas' })
      return
    }

    if (endDate <= startDate) {
      toast({ type: 'error', message: 'La hora de fin debe ser posterior a la de inicio' })
      return
    }

    const payload = {
      curso_id: cursoId,
      recinto_id: recintoId,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
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
        toast({ type: 'error', message: data.error || 'No se pudo enviar la solicitud' })
        return
      }

      if (data.reserva) {
        setReservationList(prev => [data.reserva, ...prev])
        toast({ type: 'success', message: 'Solicitud enviada correctamente' })
        form.reset()
      }
    } catch (error) {
      console.error('Error creating reservation request', error)
      toast({ type: 'error', message: 'Error al enviar la solicitud' })
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
          <p>Selecciona un curso y un recinto disponible para solicitar una nueva reserva.</p>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Nueva solicitud</h2>
          <p className="text-sm text-gray-400">Indica la fecha y el recinto que deseas reservar para tu actividad.</p>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-400">Primero debes crear al menos un curso para poder solicitar un recinto.</p>
        ) : availableRecintos.length === 0 ? (
          <p className="text-sm text-gray-400">No hay recintos disponibles en este momento. Inténtalo más tarde.</p>
        ) : (
          <form onSubmit={handleReservationSubmit} className="grid gap-3 md:grid-cols-2">
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

            <label className="text-sm">
              Fecha y hora de inicio
              <input
                type="datetime-local"
                name="start_at"
                className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                required
              />
            </label>

            <label className="text-sm">
              Fecha y hora de fin
              <input
                type="datetime-local"
                name="end_at"
                className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                required
              />
            </label>

            <label className="text-sm md:col-span-2">
              Observaciones
              <textarea
                name="observations"
                className="mt-1 w-full rounded border border-gray-700 bg-gray-900 p-2"
                rows={3}
                placeholder="Información adicional para el trabajador municipal (opcional)"
              />
            </label>

            <div className="md:col-span-2">
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
                      <span className={`rounded px-2 py-0.5 text-xs uppercase ${
                        reservation.status === 'pendiente'
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