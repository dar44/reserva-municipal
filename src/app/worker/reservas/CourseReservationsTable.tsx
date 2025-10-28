'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'

type ReservationStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'

type CourseReservationRow = {
  id: number
  curso_id: number
  recinto_id: number
  curso_name: string
  recinto_name: string
  start_at: string
  end_at: string
  status: ReservationStatus
  observations: string | null
  reviewed_at: string | null
  worker_uid: string | null
}

type Props = {
  reservations: CourseReservationRow[]
}

const statusStyles: Record<ReservationStatus, string> = {
  pendiente: 'bg-yellow-600 text-black',
  aprobada: 'bg-green-700 text-white',
  rechazada: 'bg-red-700 text-white',
  cancelada: 'bg-gray-700 text-white',
}

export default function CourseReservationsTable ({ reservations }: Props) {
  const [rows, setRows] = useState(reservations)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const toast = useToast()

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }

  const handleDecision = async (id: number, status: Exclude<ReservationStatus, 'pendiente'>) => {
    const current = rows.find(row => row.id === id)
    if (!current) return
    if (loadingId) return

    const note = window.prompt('Observaciones (opcional):')
    const body: Record<string, unknown> = { status }
    if (note !== null) {
      const trimmed = note.trim()
      body.observations = trimmed ? trimmed : null
    }

    setLoadingId(id)
    try {
      const response = await fetch(`/api/worker/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast({ type: 'error', message: data.error || 'No se pudo actualizar la reserva' })
        return
      }

      if (data.reserva) {
        setRows(prev => prev.map(row => (
          row.id === id
            ? { ...row, ...data.reserva }
            : row
        )))
        const message = status === 'aprobada'
          ? 'Reserva aprobada correctamente'
          : 'Reserva rechazada'
        toast({ type: 'success', message })
      }
    } catch (error) {
      console.error('Error updating course reservation', error)
      toast({ type: 'error', message: 'Error al actualizar la reserva' })
    } finally {
      setLoadingId(null)
    }
  }

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No hay solicitudes de reserva de cursos pendientes.</p>
  }

  return (
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
            <th className="px-4 py-2 text-left">Revisado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t border-gray-800">
              <td className="px-4 py-2">{row.curso_name}</td>
              <td className="px-4 py-2">{row.recinto_name}</td>
              <td className="px-4 py-2">{formatDateTime(row.start_at)}</td>
              <td className="px-4 py-2">{formatDateTime(row.end_at)}</td>
              <td className="px-4 py-2">
                <span className={`rounded px-2 py-0.5 text-xs uppercase ${statusStyles[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-gray-300">{row.observations ?? '—'}</td>
              <td className="px-4 py-2 text-xs text-gray-400">
                {row.reviewed_at ? formatDateTime(row.reviewed_at) : 'Pendiente'}
              </td>
              <td className="px-4 py-2">
                {row.status === 'pendiente' ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDecision(row.id, 'aprobada')}
                      className="rounded bg-emerald-600 px-3 py-1 text-xs text-white disabled:opacity-60"
                      disabled={loadingId === row.id}
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleDecision(row.id, 'rechazada')}
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-60"
                      disabled={loadingId === row.id}
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}