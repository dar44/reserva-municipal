'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

export default function DeleteButton ({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const remove = async () => {
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ type: 'success', message: 'Usuario eliminado' })
      router.push('/admin/usuarios')
    } else {
      const data = await res.json().catch(() => ({}))
      toast({ type: 'error', message: data.error || 'Error al eliminar' })
    }
  }

  return (
    <>
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
    </>
  )
}