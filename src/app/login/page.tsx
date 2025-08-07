'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage () {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) router.push('/dashboard')
    else alert('Credenciales incorrectas')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <input type="email" placeholder="email" required
        className="w-full border p-2" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" required
        className="w-full border p-2" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full bg-green-600 text-white py-2 rounded">Entrar</button>
    </form>
  )
}
