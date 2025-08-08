'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage () {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
   const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      alert('Credenciales incorrectas')
      return
    }

    const role = data.user?.app_metadata?.role as string | undefined
    
    if (role === 'admin') {
      router.push('/dashboard')
    } else if (role === 'worker') {
      router.push('/worker')
    } else if (role) {
      router.push('/recintos')
    } else {
      console.error('No se pudo determinar el rol del usuario')
      alert('No se pudo determinar el rol del usuario')
    }
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
