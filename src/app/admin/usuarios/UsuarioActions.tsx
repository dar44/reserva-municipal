'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function UsuarioActions({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const remove = async () => {
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Usuario eliminado correctamente')
      location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || 'Error al eliminar el usuario')
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/usuarios/${id}`}>Ver</Link>
      </Button>
      <Button asChild size="sm" variant="secondary">
        <Link href={`/admin/usuarios/${id}/editar`}>Modificar</Link>
      </Button>
      <Button onClick={() => setOpen(true)} size="sm" variant="destructive">
        Eliminar
      </Button>
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