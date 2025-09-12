'use client'

import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

interface Props {
  cursoId: number
  email?: string | null
  inscripcionId?: number | null
}

export default function InscripcionActions ({ cursoId, email, inscripcionId }: Props) {
  const toast = useToast()
  const [open, setOpen] = useState(false)

  const inscribir = async () => {
    await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_id: cursoId, email })
    })
    location.reload()
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
          <button disabled className="px-3 py-1 rounded text-sm bg-gray-600">Ya inscrito</button>
          <button onClick={() => setOpen(true)} className="px-3 py-1 rounded text-sm bg-red-600">Cancelar</button>
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
    <button onClick={inscribir} className="px-3 py-1 rounded text-sm bg-blue-600">
      Pagar e inscribirse
    </button>
  )
}