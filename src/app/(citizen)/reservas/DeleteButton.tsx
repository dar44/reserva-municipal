'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function DeleteButton ({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const remove = async () => {
    const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ type: 'success', message: 'Reserva eliminada' })
      router.push('/reservas')
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al eliminar' })
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-red-400">Eliminar</button>
      <ConfirmModal
        open={open}
        message="¿Eliminar la reserva?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          remove()
        }}
      />
    </>
  )
}