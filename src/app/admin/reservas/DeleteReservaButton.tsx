'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                alert(data.error || 'Error al eliminar')
            }
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar')
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="text-red-400 hover:text-red-300"
                title="Eliminar"
                disabled={isDeleting}
            >
                🗑️
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que quieres eliminar esta {tipo === 'Recinto' ? 'reserva' : 'inscripción'}?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
