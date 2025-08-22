'use client'

import Link from 'next/link'

export default function CursoActions ({ id, state }: { id: number; state: string }) {
  const toggle = async () => {
    if (!confirm('¿Cambiar el estado del curso?')) return
    await fetch(`/api/cursos/${id}/toggle`, { method: 'POST' })
    location.reload()
  }

  return (
    <div className="space-x-2">
      <Link href={`/worker/cursos/${id}/inscripcion`} className="bg-green-600 px-2 py-1 rounded text-xs">Inscribir</Link>
      <Link href={`/worker/cursos/${id}`} className="bg-blue-600 px-2 py-1 rounded text-xs">Ver detalles</Link>
      <button onClick={toggle} className={`px-2 py-1 rounded text-xs ${state === 'Disponible' ? 'bg-red-600' : 'bg-yellow-600'}`}>
        {state === 'Disponible' ? 'Cerrar' : 'Abrir'}
      </button>
    </div>
  )
}