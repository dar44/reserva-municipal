'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

const showToast = async (type: 'success' | 'error', msg: string) => {
  const { toast } = await import('react-toastify')
  toast[type](msg)
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL
    if (!redirectUrl) {
      showToast('error', 'Error de configuración: URL de redirección no disponible')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        showToast('error', error.message || 'Error al enviar el enlace de recuperación')
      } else {
        showToast('success', 'Enlace enviado. Revisa tu correo electrónico')
        setEmailSent(true)
      }
    } catch (error) {
      showToast('error', 'Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div
        className="w-full max-w-md animate-scale-in"
      >
        {/* Card con glassmorphism */}
        <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2 animate-fade-in-up delay-100"
            >
              Recuperar Contraseña
            </h1>
            <p
              className="text-foreground-secondary text-sm animate-fade-in delay-200"
            >
              {emailSent
                ? '¡Listo! Revisa tu correo electrónico'
                : 'Ingresa tu email para recibir un enlace de recuperación'
              }
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de recuperación de contraseña">
              {/* Email input con ícono */}
              <div
                className="relative group animate-fade-in-left delay-300"
              >
                <label htmlFor="reset-email" className="sr-only">Correo electrónico</label>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" aria-hidden="true" />
                <input
                  id="reset-email"
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

              {/* Botón con estado de carga */}
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={isLoading ? 'Enviando enlace, por favor espere' : 'Enviar enlace de recuperación'}
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
                  animate-fade-in-up delay-400
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div
              className="text-center space-y-4 animate-scale-in"
              role="status"
              aria-live="polite"
              aria-label="Enlace de recuperación enviado"
            >
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center" aria-hidden="true">
                <Mail className="w-8 h-8 text-success" aria-hidden="true" />
              </div>
              <p className="text-foreground-secondary">
                Hemos enviado un enlace de recuperación a <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-sm text-foreground-tertiary">
                Revisa tu bandeja de entrada y sigue las instrucciones del correo.
              </p>
            </div>
          )}

          {/* Enlaces secundarios */}
          <div
            className="mt-6 animate-fade-in delay-500"
          >
            <Link
              href="/login"
              className="
                flex items-center justify-center gap-2
                w-full h-11
                border-2 border-primary/20 text-primary
                font-medium rounded-lg
                hover:bg-primary/5 hover:border-primary
                transition-all duration-200
              "
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        </div>
      </div>
      <LazyToastContainer />
    </div>
  )
}
