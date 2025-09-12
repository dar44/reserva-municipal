'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function CursoActions ({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const remove = async () => {
    const res = await fetch(`/api/cursos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ type: 'success', message: 'Curso eliminado' })
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al eliminar' })
    }
  }

  return (
    <div className="space-x-2">
      <Link className="text-blue-400" href={`/admin/cursos/${id}`}>Ver</Link>
      <Link className="text-yellow-400" href={`/admin/cursos/${id}/editar`}>Modificar</Link>
      <button onClick={() => setOpen(true)} className="text-red-400">Eliminar</button>
      <ConfirmModal
        open={open}
        title="Eliminar curso"
        message="¿Estás seguro de eliminar el curso? Se perderán sus datos."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          remove()
        }}
      />
    </div>
  )
}