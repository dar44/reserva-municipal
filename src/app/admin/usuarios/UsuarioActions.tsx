'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'

export default function UsuarioActions ({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const remove = async () => {
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success()
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error()
    }
  }

  return (
    <div className="space-x-2">
      <Link href={`/admin/usuarios/${id}`} className="text-blue-400">Ver</Link>
      <Link href={`/admin/usuarios/${id}/editar`} className="text-yellow-400">Modificar</Link>
      <button onClick={() => setOpen(true)} className="text-red-400">Eliminar</button>
      <ConfirmModal
        open={open}
        title="Eliminar usuario"
        message="¿Estás seguro de eliminar el usuario? Se perderán sus datos."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          remove()
        }}
      />
    </div>
  )
}