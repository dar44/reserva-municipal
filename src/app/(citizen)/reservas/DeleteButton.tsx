'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

interface DeleteButtonProps {
  id: number
  type: 'Recinto' | 'Curso'
}

export default function DeleteButton({ id, type }: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const remove = async () => {
    const endpoint = type === 'Recinto'
      ? `/api/reservas/${id}`
      : `/api/inscripciones/${id}`

    const res = await fetch(endpoint, { method: 'DELETE' })

    if (res.ok) {
      toast({ type: 'success', message: `${type} eliminada correctamente` })
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al eliminar' })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
      >
        Eliminar
      </button>
      <ConfirmModal
        open={open}
        message={`¿Estás seguro de que quieres eliminar esta ${type === 'Recinto' ? 'reserva' : 'inscripción'}?`}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          remove()
        }}
      />
    </>
  )
}