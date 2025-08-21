'use client'

import Link from 'next/link'

export default function RecintoActions ({ id, state }: { id: number; state: string }) {
  const toggle = async () => {
    if (!confirm('¿Cambiar el estado del recinto?')) return
    await fetch(`/api/recintos/${id}/toggle`, { method: 'POST' })
    location.reload()
  }

  return (
    <div className="space-x-2">
      <Link href={`/worker/recintos/${id}/reservar`} className="bg-green-600 px-2 py-1 rounded text-xs">Detalles</Link>
      <button onClick={toggle} className="bg-yellow-600 px-2 py-1 rounded text-xs">
        {state === 'Disponible' ? 'No disponible' : 'Disponible'}
      </button>
    </div>
  )
}