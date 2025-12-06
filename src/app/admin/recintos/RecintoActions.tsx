'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'

export default function RecintoActions({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const remove = async () => {
    const res = await fetch(`/api/recintos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Recinto eliminado correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al eliminar el recinto')
    }
  }

  return (
    <div className="space-x-2">
      <Link href={`/admin/recintos/${id}`} className="text-blue-400">Ver</Link>
      <Link href={`/admin/recintos/${id}/editar`} className="text-yellow-400">Modificar</Link>
      <button onClick={() => setOpen(true)} className="text-red-400">Eliminar</button>
      <ConfirmModal
        open={open}
        message="¿Estás seguro de eliminar el recinto? Se perderán sus datos."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          remove()
        }}
        title="Eliminar recinto"
      />
    </div>
  )
}