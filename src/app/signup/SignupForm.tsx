'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, CreditCard, Loader2, ArrowRight, HelpCircle } from 'lucide-react'

const showToast = async (type: 'success' | 'error', msg: string) => {
  const { toast } = await import('react-toastify')
  toast[type](msg)
}

export function SignupForm() {
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
        showToast('success', '¡Cuenta creada! Bienvenido a ServiMunicipal')
        router.push('/login')
      } else {
        showToast('error', 'Error al crear la cuenta. Intenta de nuevo')
      }
    } catch (error) {
      showToast('error', 'Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (key: string) => {
    switch (key) {
      case 'email': return <Mail className="w-5 h-5" aria-hidden="true" />
      case 'password': return <Lock className="w-5 h-5" aria-hidden="true" />
      case 'name': case 'surname': return <User className="w-5 h-5" aria-hidden="true" />
      case 'dni': return <CreditCard className="w-5 h-5" aria-hidden="true" />
      case 'phone': return <Phone className="w-5 h-5" aria-hidden="true" />
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

  const getAutoComplete = (key: string) => {
    const map: Record<string, string> = {
      email: 'email',
      password: 'new-password',
      name: 'given-name',
      surname: 'family-name',
      phone: 'tel',
    }
    return map[key] || 'off'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de registro">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(form).map(([key, val]) => (
          <div
            key={key}
            className={`relative group ${key === 'email' || key === 'password' ? 'md:col-span-2' : ''}`}
          >
            <label htmlFor={`signup-${key}`} className="block text-sm font-medium text-foreground-secondary mb-2">
              <span className="flex items-center gap-1.5">
                {getLabel(key)}
                {(key === 'dni') && (
                  <span title="Documento Nacional de Identidad." aria-label="Ayuda: Documento Nacional de Identidad">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" aria-hidden="true" />
                  </span>
                )}
                {(key === 'phone') && (
                  <span title="Formato recomendado: +34 600 000 000." aria-label="Ayuda: Formato recomendado +34 600 000 000">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" aria-hidden="true" />
                  </span>
                )}
                {(key === 'password') && (
                  <span title="Mínimo 8 caracteres." aria-label="Ayuda: Mínimo 8 caracteres">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" aria-hidden="true" />
                  </span>
                )}
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200">
                {getIcon(key)}
              </div>
              <input
                id={`signup-${key}`}
                type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                placeholder={getLabel(key)}
                required
                autoComplete={getAutoComplete(key)}
                className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
                value={val}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                disabled={isLoading}
                {...(key === 'password' && { minLength: 8 })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? 'Creando cuenta, por favor espere' : 'Crear cuenta'}
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
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <span>Crear cuenta</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
