'use client'

export default function DeleteButton ({ id }: { id: number }) {
  const remove = async () => {
    if (!confirm('¿Eliminar la reserva?')) return
    await fetch(`/api/reservas/${id}`, { method: 'DELETE' })
    location.reload()
  }

  return (
    <button onClick={remove} className="bg-red-600 px-2 py-1 rounded text-xs">Eliminar</button>
  )
}