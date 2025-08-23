'use client'

interface Props {
  cursoId: number
  email?: string | null
  inscripcionId?: number | null
}

export default function InscripcionActions ({ cursoId, email, inscripcionId }: Props) {
  const inscribir = async () => {
    await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_id: cursoId, email })
    })
    location.reload()
  }

  const cancelar = async () => {
    if (!inscripcionId) return
    if (!confirm('¿Cancelar inscripción?')) return
    await fetch(`/api/inscripciones/${inscripcionId}`, { method: 'DELETE' })
    location.reload()
  }

  if (inscripcionId) {
    return (
      <div className="flex gap-2">
        <button disabled className="px-3 py-1 rounded text-sm bg-gray-600">Ya inscrito</button>
        <button onClick={cancelar} className="px-3 py-1 rounded text-sm bg-red-600">Cancelar</button>
      </div>
    )
  }

  return (
    <button onClick={inscribir} className="px-3 py-1 rounded text-sm bg-blue-600">
      Pagar e inscribirse
    </button>
  )
}