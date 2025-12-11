'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'
import { Button } from '@/components/ui/button'

interface Props {
  cursoId: number
  email?: string | null
  inscripcionId?: number | null
}

export default function InscripcionActions({ cursoId, email, inscripcionId }: Props) {
  const toast = useToast()
  const [open, setOpen] = useState(false)

  const inscribir = async () => {
    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_id: cursoId, email })
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.checkoutUrl) {
      window.location.href = data.checkoutUrl as string
    } else if (!res.ok) {
      toast({ type: 'error', message: data.error || 'No se pudo iniciar el pago' })
    }
  }

  const cancelar = async () => {
    if (!inscripcionId) return
    const res = await fetch(`/api/inscripciones/${inscripcionId}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ type: 'success', message: 'Inscripción cancelada' })
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al cancelar' })
    }
  }

  if (inscripcionId) {
    return (
      <>
        <div className="flex gap-2">
          <Button disabled variant="secondary" size="sm">Ya inscrito</Button>
          <Button onClick={() => setOpen(true)} variant="destructive" size="sm">Cancelar</Button>
        </div>
        <ConfirmModal
          open={open}
          message="¿Cancelar inscripción?"
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false)
            cancelar()
          }}
        />
      </>
    )
  }

  return (
    <Button
      onClick={inscribir}
      size="sm"
      className="hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all"
    >
      Pagar e inscribirse
    </Button>
  )
}