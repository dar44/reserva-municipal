'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', name: '', surname: '', dni: '', phone: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) router.push('/login')
    else toast.error('Error al crear la cuenta. Intenta de nuevo')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-3">
      {Object.entries(form).map(([key, val]) => (
        <input
          key={key}
          type={key === 'password' ? 'password' : 'text'}
          placeholder={key}
          required
          className="w-full border p-2 rounded"
          value={val}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <button className="w-full bg-blue-600 text-white py-2 rounded">Crear cuenta</button>
    </form>
  )
}
