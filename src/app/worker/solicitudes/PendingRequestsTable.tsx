'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
        return <p className="text-secondary">No hay solicitudes pendientes.</p>
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organizador</TableHead>
                            <TableHead>Recinto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <div className="font-medium">{row.organizer_name}</div>
                                    <div className="text-xs text-tertiary">{formatDate(row.created_at)}</div>
                                </TableCell>
                                <TableCell className="text-secondary">{row.recinto_name}</TableCell>
                                <TableCell className="text-secondary text-xs">{formatDate(row.start_at)}</TableCell>
                                <TableCell className="text-secondary text-xs">
                                    {formatTime(row.start_at)}-{formatTime(row.end_at)}
                                </TableCell>
                                <TableCell className="text-xs text-secondary">
                                    {truncate(row.observations)}
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-warning text-warning-foreground">
                                        Pendiente
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() => openDecisionModal(row.id, 'aprobada')}
                                            size="sm"
                                            className="bg-success hover:bg-success/90"
                                            disabled={loadingId === row.id}
                                        >
                                            ✓ Aprobar
                                        </Button>
                                        <Button
                                            onClick={() => openDecisionModal(row.id, 'rechazada')}
                                            size="sm"
                                            variant="destructive"
                                            disabled={loadingId === row.id}
                                        >
                                            ✗ Rechazar
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
