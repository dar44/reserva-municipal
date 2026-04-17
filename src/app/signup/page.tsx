'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { Mail, Lock, User, Phone, CreditCard, Loader2, ArrowRight, HelpCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', name: '', surname: '', dni: '', phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast.success('¡Cuenta creada! Bienvenido a ServiMunicipal')
        router.push('/login')
      } else {
        toast.error('Error al crear la cuenta. Intenta de nuevo')
      }
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (key: string) => {
    switch (key) {
      case 'email': return <Mail className="w-5 h-5" />
      case 'password': return <Lock className="w-5 h-5" />
      case 'name': case 'surname': return <User className="w-5 h-5" />
      case 'dni': return <CreditCard className="w-5 h-5" />
      case 'phone': return <Phone className="w-5 h-5" />
      default: return null
    }
  }

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      email: 'Correo electrónico',
      password: 'Contraseña',
      name: 'Nombre',
      surname: 'Apellidos',
      dni: 'DNI/NIE',
      phone: 'Teléfono'
    }
    return labels[key] || key
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <nav className="w-full px-6 h-16 flex items-center justify-between border-b border-border bg-background/60 backdrop-blur-sm">
        <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" aria-label="Ir al inicio">
          <span className="text-xl font-black tracking-tight text-foreground">
            Servi<span className="text-primary font-medium">Municipal</span>
          </span>
        </Link>
        <div className="flex h-full items-center gap-1 text-sm">
          <Link href="/public/recintos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300">Recintos</Link>
          <Link href="/public/cursos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300">Cursos</Link>
          <Link href="/login" className="h-full flex items-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl animate-scale-in"
      >
        {/* Card con glassmorphism */}
        <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2 animate-fade-in-up delay-100"
            >
              Crear Cuenta
            </h1>
            <p
              className="text-foreground-secondary text-sm animate-fade-in delay-200"
            >
              Únete a ServiMunicipal y gestiona tus reservas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid de inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(form).map(([key, val], index) => (
                <div
                  key={key}
                  className={`relative group animate-fade-in-left ${key === 'email' || key === 'password' ? 'md:col-span-2' : ''}`}
                  style={{ animationDelay: `${0.1 * (index + 3)}s` }}
                >
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">
                    <span className="flex items-center gap-1.5">
                      {getLabel(key)}
                      {(key === 'dni') && (
                        <span title="Documento Nacional de Identidad. Formato: 12345678A (8 dígitos seguidos de una letra).">
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </span>
                      )}
                      {(key === 'phone') && (
                        <span title="Formato recomendado: +34 600 000 000. Se usará para notificaciones.">
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </span>
                      )}
                      {(key === 'password') && (
                        <span title="Mínimo 8 caracteres. Usa letras, números y símbolos para mayor seguridad.">
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </span>
                      )}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200">
                      {getIcon(key)}
                    </div>
                    <input
                      type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                      placeholder={getLabel(key)}
                      required
                      className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
                      value={val}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      disabled={isLoading}
                      {...(key === 'password' && { minLength: 8 })}
                    />
                  </div>
                  {key === 'password' && (
                    <p className="text-xs text-foreground-tertiary mt-1">
                      Mínimo 8 caracteres
                    </p>
                  )}
                </div>
              ))}
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
                animate-fade-in-up delay-800
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Enlaces secundarios */}
          <div
            className="mt-6 text-center animate-fade-in delay-900"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-foreground-secondary">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="
                block w-full h-11
                border-2 border-primary/20 text-primary
                font-medium rounded-lg
                hover:bg-primary/5 hover:border-primary
                transition-all duration-200
                flex items-center justify-center
              "
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
      </div>
      <LazyToastContainer />
    </div>
  )
}

