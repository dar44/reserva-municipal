'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/Toast'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const toast = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({ type: 'error', message: 'No se pudo actualizar' })
    } else {
      toast({ type: 'success', message: 'Contraseña actualizada' })
      router.replace('/login')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <input
        type="password"
        placeholder="Nueva contraseña"
        required
        className="w-full border p-2"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="w-full bg-green-600 text-white py-2 rounded">
        Actualizar contraseña
      </button>
    </form>
  )
}