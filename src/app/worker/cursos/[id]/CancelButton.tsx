'use client'

export default function CancelButton ({ id }: { id: number }) {
  const cancel = async () => {
    if (!confirm('¿Cancelar inscripción?')) return
    await fetch(`/api/inscripciones/${id}`, { method: 'DELETE' })
    location.reload()
  }

  return (
    <button onClick={cancel} className="bg-red-600 px-2 py-1 rounded text-xs">
      Cancelar Inscripción
    </button>
  )
}