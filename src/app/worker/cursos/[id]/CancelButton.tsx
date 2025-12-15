'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function CancelButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const cancel = async () => {
    const res = await fetch(`/api/inscripciones/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Inscripción cancelada correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al cancelar la inscripción')
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive" size="sm">
        Cancelar inscripción
      </Button>
      <ConfirmModal
        open={open}
        message="¿Cancelar la inscripción?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          cancel()
        }}
      />
    </>
  )
}