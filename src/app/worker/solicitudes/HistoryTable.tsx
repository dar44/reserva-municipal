'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type ReservationStatus = 'aprobada' | 'rechazada'

type HistoryRow = {
    id: number
    organizer_name: string
    created_at: string
    recinto_name: string
    start_at: string
    end_at: string
    status: ReservationStatus
    request_reason: string | null
    observations: string | null
}

type Props = {
    history: HistoryRow[]
}



export default function HistoryTable({ history }: Props) {
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

    if (history.length === 0) {
        return <p className="text-secondary">No hay historial de solicitudes.</p>
    }

    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organizador</TableHead>
                        <TableHead>Recinto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Respuesta</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map(row => (
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
                                {truncate(row.request_reason)}
                            </TableCell>
                            <TableCell>
                                <Badge className={row.status === 'aprobada' ? "bg-success text-success-foreground" : "bg-error text-error-foreground"}>
                                    {row.status === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-secondary">
                                {truncate(row.observations)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
