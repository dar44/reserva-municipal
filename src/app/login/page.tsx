'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      toast({ type: 'error', message: 'Credenciales incorrectas' })
      return
    }

    const data = await res.json()
    console.log('Rol obtenido en cliente:', data.role)

    switch (data.role) {
      case 'admin':
        router.replace('/admin/panel')
        break
      case 'worker':
        router.replace('/worker/panel')
        break
      case 'organizer':
        router.replace('/organizer/panel')
        break
      default:
        router.replace('/recintos')
        break
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-3">
        <input
          type="email"
          placeholder="email"
          required
          className="w-full border p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          required
          className="w-full border p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white py-2 rounded">
          Entrar
        </button>
      </form>
      <div className="max-w-sm mx-auto mt-4 space-y-2 text-center">
        <Link href="/auth/reset-password" className="block text-sm text-blue-600">
          ¿Has olvidado la contraseña?
        </Link>
        <Link
          href="/signup"
          className="block w-full rounded bg-blue-600 py-2 text-white"
        >
          Crear cuenta
        </Link>
      </div>
    </>
  )
}
