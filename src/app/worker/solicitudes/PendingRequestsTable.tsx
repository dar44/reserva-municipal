'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

type ReservationStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'

type PendingRequestRow = {
    id: number
    organizer_name: string
    created_at: string
    recinto_name: string
    start_at: string
    end_at: string
    status: ReservationStatus
    observations: string | null
}

type Props = {
    requests: PendingRequestRow[]
}

type DecisionStatus = 'aprobada' | 'rechazada'

const decisionCopy: Record<DecisionStatus, { title: string; confirm: string; helper: string; success: string }> = {
    aprobada: {
        title: 'Aprobar solicitud',
        confirm: 'Aprobar',
        helper: 'Puedes añadir observaciones para el organizador (opcional).',
        success: 'Reserva aprobada correctamente',
    },
    rechazada: {
        title: 'Rechazar solicitud',
        confirm: 'Rechazar',
        helper: 'Indica el motivo del rechazo para el organizador (opcional).',
        success: 'Reserva rechazada',
    },
}

export default function PendingRequestsTable({ requests }: Props) {
    const [rows, setRows] = useState(requests)
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [decisionTarget, setDecisionTarget] = useState<{ id: number; status: DecisionStatus } | null>(null)
    const [decisionNote, setDecisionNote] = useState('')
    const formatDate = (value: string) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return date.toLocaleDateString('es-ES')
    }

    const formatTime = (value: string) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }

    const truncate = (text: string | null, maxLength: number = 50) => {
        if (!text) return '—'
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    const openDecisionModal = (id: number, status: DecisionStatus) => {
        setDecisionTarget({ id, status })
        setDecisionNote('')
    }

    const closeDecisionModal = () => {
        if (decisionTarget && loadingId === decisionTarget.id) return
        setDecisionTarget(null)
        setDecisionNote('')
    }

    const confirmDecision = () => {
        if (!decisionTarget) return
        submitDecision(decisionTarget.id, decisionTarget.status, decisionNote)
    }

    const isModalProcessing = decisionTarget ? loadingId === decisionTarget.id : false

    const submitDecision = async (id: number, status: DecisionStatus, observationsNote: string) => {
        const current = rows.find(row => row.id === id)
        if (!current) return
        if (loadingId) return

        const trimmedNote = observationsNote.trim()
        const body: Record<string, unknown> = { status }
        if (trimmedNote) {
            body.observations = trimmedNote
        } else {
            body.observations = null
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
                toast.error(data?.error || 'Error al procesar la solicitud')
                return
            }

            if (data.reserva) {
                // Eliminar de la lista de pendientes
                setRows(prev => prev.filter(row => row.id !== id))
                toast.success(decisionCopy[status].success)
                setDecisionTarget(null)
                setDecisionNote('')
                // Recargar página para actualizar estadísticas
                setTimeout(() => location.reload(), 1000)
            }
        } catch (error) {
            console.error('Error updating course reservation', error)
            toast.error('Error al procesar la solicitud')
        } finally {
            setLoadingId(null)
        }
    }

    if (rows.length === 0) {
        return <p className="text-sm text-gray-400">No hay solicitudes pendientes.</p>
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded bg-gray-800 text-sm">
                    <thead className="bg-gray-700 text-xs uppercase text-gray-300">
                        <tr>
                            <th className="px-4 py-2 text-left">Organizador</th>
                            <th className="px-4 py-2 text-left">Recinto</th>
                            <th className="px-4 py-2 text-left">Fecha solicitada</th>
                            <th className="px-4 py-2 text-left">Horario</th>
                            <th className="px-4 py-2 text-left">Motivo</th>
                            <th className="px-4 py-2 text-left">Estado</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id} className="border-t border-gray-700">
                                <td className="px-4 py-2">
                                    <div>
                                        <div className="font-medium">{row.organizer_name}</div>
                                        <div className="text-xs text-gray-400">{formatDate(row.created_at)}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-2">{row.recinto_name}</td>
                                <td className="px-4 py-2">{formatDate(row.start_at)}</td>
                                <td className="px-4 py-2">
                                    {formatTime(row.start_at)}-{formatTime(row.end_at)}
                                </td>
                                <td className="px-4 py-2 text-xs text-gray-300">
                                    {truncate(row.observations)}
                                </td>
                                <td className="px-4 py-2">
                                    <span className="rounded bg-yellow-600 px-2 py-0.5 text-xs uppercase text-black">
                                        Pendiente
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openDecisionModal(row.id, 'aprobada')}
                                            className="rounded bg-emerald-600 px-3 py-1 text-xs text-white disabled:opacity-60 hover:bg-emerald-500"
                                            disabled={loadingId === row.id}
                                        >
                                            ✓ Aprobar
                                        </button>
                                        <button
                                            onClick={() => openDecisionModal(row.id, 'rechazada')}
                                            className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-60 hover:bg-red-500"
                                            disabled={loadingId === row.id}
                                        >
                                            ✗ Rechazar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {decisionTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={closeDecisionModal}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="w-full max-w-md rounded border border-gray-700 bg-gray-900 p-6 shadow-lg"
                        onClick={event => event.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-100">{decisionCopy[decisionTarget.status].title}</h3>
                        <p className="mt-2 text-sm text-gray-400">{decisionCopy[decisionTarget.status].helper}</p>
                        <textarea
                            className="mt-4 w-full rounded border border-gray-700 bg-gray-900 p-2 text-sm"
                            rows={4}
                            placeholder="Observaciones (opcional)"
                            value={decisionNote}
                            onChange={event => setDecisionNote(event.target.value)}
                        />
                        <div className="mt-4 flex justify-end gap-2 text-sm">
                            <button
                                type="button"
                                onClick={closeDecisionModal}
                                className="rounded border border-gray-600 px-4 py-2 text-gray-200 transition hover:bg-gray-800"
                                disabled={isModalProcessing}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDecision}
                                className="rounded bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:opacity-60"
                                disabled={isModalProcessing}
                            >
                                {isModalProcessing ? 'Guardando…' : decisionCopy[decisionTarget.status].confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
