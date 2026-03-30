'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function CursoActions({ id, state }: { id: number; state: string }) {
  const [open, setOpen] = useState(false)
  const toggle = async () => {
    const res = await fetch(`/api/cursos/${id}/toggle`, { method: 'POST' })
    if (res.ok) {
      toast.success('Estado del curso cambiado correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al cambiar el estado del curso')
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {state === 'Disponible' ? (
        <Button asChild size="sm">
          <Link href={`/worker/cursos/${id}/inscripcion`}>Inscribir</Link>
        </Button>
      ) : (
        <Button disabled size="sm" variant="secondary">Inscribir</Button>
      )}
      <Link
        href={`/worker/cursos/${id}`}
        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
      >
        Ver detalles
      </Link>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        variant={state === 'Disponible' ? 'destructive' : 'default'}
      >
        {state === 'Disponible' ? 'Cerrar' : 'Abrir'}
      </Button>
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