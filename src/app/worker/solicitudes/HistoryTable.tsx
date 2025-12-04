'use client'

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

const statusStyles: Record<ReservationStatus, string> = {
    aprobada: 'bg-green-700 text-white',
    rechazada: 'bg-red-700 text-white',
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
        return <p className="text-sm text-gray-400">No hay historial de solicitudes.</p>
    }

    return (
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
                        <th className="px-4 py-2 text-left">Respuesta</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(row => (
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
                                {truncate(row.request_reason)}
                            </td>
                            <td className="px-4 py-2">
                                <span className={`rounded px-2 py-0.5 text-xs uppercase ${statusStyles[row.status]}`}>
                                    {row.status === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300">
                                {truncate(row.observations)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
