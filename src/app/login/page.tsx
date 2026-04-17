'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
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
      console.log('Rol obtenido en cliente:', data.role)

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <nav className="w-full border-b border-border bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" aria-label="Ir al inicio">
            <span className="text-xl font-black tracking-tight text-foreground">
              Servi<span className="text-primary font-medium">Municipal</span>
            </span>
          </Link>
          <div className="flex h-full items-center gap-1 text-sm">
            <Link href="/public/recintos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300">Recintos</Link>
            <Link href="/public/cursos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300">Cursos</Link>
            <Link href="/signup" className="h-full flex items-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md animate-scale-in"
        >
          {/* Card con glassmorphism sutil */}
          <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <h1
                className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2 animate-fade-in-up delay-100"
              >
                ServiMunicipal
              </h1>
              <p
                className="text-foreground-secondary text-sm animate-fade-in delay-200"
              >
                Gestión inteligente de servicios municipales
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input con ícono */}
              <div
                className="relative group animate-fade-in-left delay-300"
              >
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

              {/* Password input con ícono */}
              <div
                className="relative group animate-fade-in-left delay-400"
              >
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

              {/* Botón con estado de carga */}
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
                animate-fade-in-up delay-500
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

            {/* Enlaces secundarios */}
            <div
              className="mt-6 space-y-3 animate-fade-in delay-600"
            >
              <Link
                href="/auth/reset-password"
                className="block text-center text-sm text-primary hover:text-primary-hover transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-foreground-secondary">
                    ¿No tienes cuenta?
                  </span>
                </div>
              </div>

              <Link
                href="/signup"
                className="
                block w-full h-11
                border-2 border-primary/20 text-primary
                font-medium rounded-lg
                hover:bg-primary/5 hover:border-primary
                transition-all duration-200
                flex items-center justify-center
              "
              >
                Crear cuenta nueva
              </Link>
            </div>
          </div>
        </div>
      </div>
      <LazyToastContainer />
    </div>
  )
}
