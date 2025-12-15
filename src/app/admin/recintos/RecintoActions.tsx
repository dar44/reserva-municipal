'use client'

import { useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

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
    <div className="flex gap-2 justify-center">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/recintos/${id}`}>Ver</Link>
      </Button>
      <Button asChild size="sm" variant="secondary">
        <Link href={`/admin/recintos/${id}/editar`}>Modificar</Link>
      </Button>
      <Button onClick={() => setOpen(true)} size="sm" variant="destructive">
        Eliminar
      </Button>
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