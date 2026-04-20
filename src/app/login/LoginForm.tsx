'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

const showToast = async (type: 'success' | 'error', msg: string) => {
  const { toast } = await import('react-toastify')
  toast[type](msg)
}

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
        showToast('error', 'Error al iniciar sesión. Verifica tus credenciales')
        return
      }

      const data = await res.json()

      showToast('success', '¡Bienvenido! Redirigiendo...')

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
      showToast('error', 'Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de inicio de sesión">
      <div className="relative group">
        <label htmlFor="login-email" className="sr-only">Correo electrónico</label>
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" aria-hidden="true" />
        <input
          id="login-email"
          type="email"
          placeholder="Correo electrónico"
          required
          autoComplete="email"
          className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="relative group">
        <label htmlFor="login-password" className="sr-only">Contraseña</label>
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" aria-hidden="true" />
        <input
          id="login-password"
          type="password"
          placeholder="Contraseña"
          required
          autoComplete="current-password"
          className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? 'Iniciando sesión, por favor espere' : 'Iniciar sesión'}
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
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span>Iniciar sesión</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
