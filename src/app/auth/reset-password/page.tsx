'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL
    if (!redirectUrl) {
      toast.error('Error de configuración: URL de redirección no disponible')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast.error(error.message || 'Error al enviar el enlace de recuperación')
      } else {
        toast.success('Enlace enviado. Revisa tu correo electrónico')
        setEmailSent(true)
      }
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Card con glassmorphism */}
        <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2"
            >
              Recuperar Contraseña
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-foreground-secondary text-sm"
            >
              {emailSent
                ? '¡Listo! Revisa tu correo electrónico'
                : 'Ingresa tu email para recibir un enlace de recuperación'
              }
            </motion.p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input con ícono */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group"
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
              </motion.div>

              {/* Botón con estado de carga */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <p className="text-foreground-secondary">
                Hemos enviado un enlace de recuperación a <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-sm text-foreground-tertiary">
                Revisa tu bandeja de entrada y sigue las instrucciones del correo.
              </p>
            </motion.div>
          )}

          {/* Enlaces secundarios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: emailSent ? 0.3 : 0.5 }}
            className="mt-6"
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
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio de sesión</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
