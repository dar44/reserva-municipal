'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import ConfirmModal from '@/components/ConfirmModal'

type Props = {
    id: number
    tipo: 'Recinto' | 'Curso'
}

export default function DeleteReservaButton({ id, tipo }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const endpoint = tipo === 'Recinto' ? `/api/reservas/${id}` : `/api/inscripciones/${id}`
            const res = await fetch(endpoint, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success(tipo === 'Recinto' ? 'Reserva eliminada' : 'Inscripción eliminada')
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || 'Error al eliminar')
            }
        } catch (error) {
            console.error('Error al eliminar:', error)
            toast.error('Error al eliminar')
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <Button
                onClick={() => setShowConfirm(true)}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
            >
                Eliminar
            </Button>

            <ConfirmModal
                open={showConfirm}
                message={`¿Estás seguro de que quieres eliminar esta ${tipo === 'Recinto' ? 'reserva' : 'inscripción'}?`}
                onCancel={() => setShowConfirm(false)}
                onConfirm={() => {
                    setShowConfirm(false)
                    handleDelete()
                }}
            />
        </>
    )
}
