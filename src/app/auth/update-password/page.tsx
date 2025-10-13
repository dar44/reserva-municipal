'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/Toast'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const sp = useSearchParams()
  const toast = useToast()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const alreadyRan = useRef(false)

  useEffect(() => {
    if (alreadyRan.current) return
    alreadyRan.current = true

    ;(async () => {
      try {
        const type = sp.get('type')
        const token_hash = sp.get('token_hash')

        if (type === 'recovery' && token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash,
          })
          if (error) throw error
          setReady(true) // ya hay sesión → permitir cambio
        } else {
          throw new Error('Enlace inválido: falta token de recuperación.')
        }
      } catch (e: any) {
        toast({ type: 'error', message: `No se pudo iniciar la recuperación: ${e.message ?? e}` })
      } finally {
        setLoading(false)
      }
    })()
  }, [sp, toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) {
      toast({ type: 'error', message: 'Abre esta página desde el enlace del correo.' })
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({ type: 'error', message: `No se pudo actualizar: ${error.message}` })
    } else {
      toast({ type: 'success', message: 'Contraseña actualizada' })
      router.replace('/login')
    }
  }

  if (loading) return <p className="p-6 text-center">Cargando…</p>

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
      <button
        className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-60"
        disabled={!ready}
      >
        Actualizar contraseña
      </button>
      {!ready && (
        <p className="text-sm text-gray-600">
          Debes abrir esta página desde el enlace del email de recuperación.
        </p>
      )}
    </form>
  )
}
