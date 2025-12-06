'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'

export default function RecintoActions({ id, state }: { id: number; state: string }) {
  const [open, setOpen] = useState(false)
  const toggle = async () => {
    const res = await fetch(`/api/recintos/${id}/toggle`, { method: 'POST' })
    if (res.ok) {
      toast.success('Estado del recinto cambiado correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al cambiar el estado del recinto')
    }
  }

  return (
    <div className="space-x-2">
      {state === 'Disponible' ? (
        <Link href={`/worker/recintos/${id}/reservar`} className="bg-green-600 px-2 py-1 rounded text-xs">Reservar</Link>
      ) : (
        <button disabled className="bg-gray-500 px-2 py-1 rounded text-xs cursor-not-allowed opacity-50">Reservar</button>
      )}
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