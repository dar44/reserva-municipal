'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function DeleteButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const remove = async () => {
    const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Reserva eliminada correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al eliminar la reserva')
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive" size="sm">Eliminar</Button>
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