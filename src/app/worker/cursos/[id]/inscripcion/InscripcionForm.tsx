'use client'

import { useState } from 'react'

export default function InscripcionForm ({ cursoId }: { cursoId: number }) {
  const [isNew, setIsNew] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      curso_id: cursoId,
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

    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      alert('Inscripción creada')
      window.location.href = '/worker/cursos'
    } else {
      const data = await res.json()
      alert(data.error || 'Error al crear la inscripción')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm">¿El participante tiene cuenta en el sistema?</p>
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
      <button className="w-full bg-green-600 py-2 rounded">Confirmar Inscripción</button>
    </form>
  )
}