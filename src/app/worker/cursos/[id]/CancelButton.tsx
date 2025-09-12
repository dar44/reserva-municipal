'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function CancelButton ({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const cancel = async () => {
    const res = await fetch(`/api/inscripciones/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ type: 'success', message: 'Inscripción cancelada' })
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al cancelar' })
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-red-600 px-2 py-1 rounded text-xs">
        Cancelar Inscripción
      </button>
      <ConfirmModal
        open={open}
        message="¿Cancelar inscripción?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          cancel()
        }}
      />
    </>
  )
}