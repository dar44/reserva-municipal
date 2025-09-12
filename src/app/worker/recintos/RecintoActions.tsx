'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function RecintoActions ({ id, state }: { id: number; state: string }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const toggle = async () => {
    const res = await fetch(`/api/recintos/${id}/toggle`, { method: 'POST' })
    if (res.ok) {
      toast({ type: 'success', message: 'Estado actualizado' })
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al actualizar' })
    }
  }

  return (
    <div className="space-x-2">
      <Link href={`/worker/recintos/${id}/reservar`} className="bg-green-600 px-2 py-1 rounded text-xs">Detalles</Link>
      <button onClick={() => setOpen(true)} className="bg-yellow-600 px-2 py-1 rounded text-xs">
        {state === 'Disponible' ? 'No disponible' : 'Disponible'}
      </button>
      <ConfirmModal
        open={open}
        message="¿Cambiar el estado del recinto?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          toggle()
        }}
      />
    </div>
  )
}