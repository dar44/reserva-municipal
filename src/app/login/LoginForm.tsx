'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        toast.error('Error al iniciar sesión. Verifica tus credenciales')
        return
      }

      const data = await res.json()

      toast.success('¡Bienvenido! Redirigiendo...')

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
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative group">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" />
        <input
          type="email"
          placeholder="Correo electrónico"
          required
          className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="relative group">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" />
        <input
          type="password"
          placeholder="Contraseña"
          required
          className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="
        w-full h-12 
        bg-gradient-to-r from-primary to-primary-hover
        text-primary-foreground font-semibold rounded-lg
        shadow-lg shadow-primary/25
        hover:shadow-xl hover:shadow-primary/40
        hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:scale-100
      "
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span>Iniciar sesión</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}
