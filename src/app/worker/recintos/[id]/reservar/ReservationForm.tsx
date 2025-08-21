'use client'

import { useState } from 'react'

export default function ReservationForm ({ recintoId }: { recintoId: number }) {
  const [isNew, setIsNew] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      recinto_id: recintoId,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      email: formData.get('email') as string,
      newUser: isNew,
    }
    if (isNew) {
      Object.assign(payload, {
        name: formData.get('name') as string,
        surname: formData.get('surname') as string,
        dni: formData.get('dni') as string,
        phone: formData.get('phone') as string,
      })
    }

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      alert('Reserva creada')
      window.location.href = '/worker/recintos'
    } else {
      const data = await res.json()
      alert(data.error || 'Error al crear la reserva')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">Fecha
        <input type="date" name="date" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" required />
      </label>
      <label className="block text-sm">Hora
        <input type="time" name="time" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" required />
      </label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => setIsNew(false)} className={`px-3 py-1 rounded text-xs ${!isNew ? 'bg-blue-600' : 'bg-gray-600'}`}>Usuario existente</button>
          <button type="button" onClick={() => setIsNew(true)} className={`px-3 py-1 rounded text-xs ${isNew ? 'bg-blue-600' : 'bg-gray-600'}`}>Nuevo usuario</button>
        </div>
        <input type="email" name="email" placeholder="Correo electrónico" className="w-full bg-gray-900 border border-gray-700 rounded p-2" required />
        {isNew && (
          <>
            <input type="text" name="name" placeholder="Nombre" className="w-full bg-gray-900 border border-gray-700 rounded p-2" required />
            <input type="text" name="surname" placeholder="Apellido" className="w-full bg-gray-900 border border-gray-700 rounded p-2" required />
            <input type="text" name="dni" placeholder="DNI" className="w-full bg-gray-900 border border-gray-700 rounded p-2" required />
            <input type="text" name="phone" placeholder="Teléfono" className="w-full bg-gray-900 border border-gray-700 rounded p-2" required />
          </>
        )}
      </div>
      <button className="w-full bg-green-600 py-2 rounded">Confirmar Reserva</button>
    </form>
  )
}