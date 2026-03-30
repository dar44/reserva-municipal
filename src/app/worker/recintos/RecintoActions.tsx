'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

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
    <div className="flex gap-2 justify-center">
      {state === 'Disponible' ? (
        <Button asChild size="sm">
          <Link href={`/worker/recintos/${id}/reservar`}>Reservar</Link>
        </Button>
      ) : (
        <Button disabled size="sm" variant="secondary">Reservar</Button>
      )}
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 text-xs font-semibold rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
      >
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