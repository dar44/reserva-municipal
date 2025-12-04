'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function CursoActions({ id, state }: { id: number; state: string }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const toggle = async () => {
    const res = await fetch(`/api/cursos/${id}/toggle`, { method: 'POST' })
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
      {state === 'Disponible' ? (
        <Link href={`/worker/cursos/${id}/inscripcion`} className="bg-green-600 px-2 py-1 rounded text-xs">Inscribir</Link>
      ) : (
        <button disabled className="bg-gray-500 px-2 py-1 rounded text-xs cursor-not-allowed opacity-50">Inscribir</button>
      )}
      <Link href={`/worker/cursos/${id}`} className="bg-blue-600 px-2 py-1 rounded text-xs">Ver detalles</Link>
      <button
        onClick={() => setOpen(true)}
        className={`px-2 py-1 rounded text-xs ${state === 'Disponible' ? 'bg-red-600' : 'bg-yellow-600'}`}
      >
        {state === 'Disponible' ? 'Cerrar' : 'Abrir'}
      </button>
      <ConfirmModal
        open={open}
        message="¿Cambiar el estado del curso?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          toggle()
        }}
      />
    </div>
  )
}