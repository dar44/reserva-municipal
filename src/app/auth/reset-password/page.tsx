'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL
    if (!redirectUrl) {
      toast.error()
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    if (error) {
      toast.error()
    } else {
      toast.success()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 space-y-3">
      <input
        type="email"
        placeholder="email"
        required
        className="w-full border p-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button className="w-full bg-green-600 text-white py-2 rounded">
        Enviar enlace
      </button>
    </form>
  )
}