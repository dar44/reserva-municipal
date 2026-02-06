'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function UpdatePasswordClient() {
  const sp = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const alreadyRan = useRef(false)

  useEffect(() => {
    if (alreadyRan.current) return
    alreadyRan.current = true

      ; (async () => {
        try {
          // Manejar errores que vienen en la URL (enlaces expirados, etc.)
          const errorParam = sp.get('error')
          const errorDescription = sp.get('error_description')

          if (errorParam) {
            const errorMsg = errorDescription
              ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
              : errorParam
            throw new Error(errorMsg)
          }

          // Diferentes formatos de token que Supabase puede enviar  
          const type = sp.get('type')
          const token = sp.get('token')
          const token_hash = sp.get('token_hash')
          const access_token = sp.get('access_token')
          const refresh_token = sp.get('refresh_token')

          // Caso 1: Viene con access_token y refresh_token directamente (hash redirect)
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            })
            if (error) throw error
            setReady(true)
          }
          // Caso 2: Formato recovery con token
          else if (type === 'recovery' && token) {
            const { error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash: token,
            })
            if (error) throw error
            setReady(true)
          }
          // Caso 3: Formato antiguo con token_hash
          else if (type === 'recovery' && token_hash) {
            const { error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash,
            })
            if (error) throw error
            setReady(true)
          } else {
            throw new Error('Enlace inválido: falta información de recuperación.')
          }
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : typeof e === 'string' ? e : 'Error desconocido'
          toast.error(`No se pudo iniciar la recuperación: ${msg}`)
        } finally {
          setLoading(false)
        }
      })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) {
      toast.error('Sesión no válida. Por favor, usa el enlace del correo')
      return
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(`No se pudo actualizar: ${error.message}`)
      } else {
        toast.success('Contraseña actualizada correctamente')
        setTimeout(() => router.replace('/login'), 2000)
      }
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="surface rounded-2xl shadow-2xl p-8 border border-border w-full max-w-md"
        >
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-foreground-secondary">Verificando enlace de recuperación...</p>
          </div>
        </motion.div>
      </div>
    )
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
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${ready ? 'bg-success/10' : 'bg-error/10'
                }`}
            >
              {ready ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <AlertCircle className="w-8 h-8 text-error" />
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2"
            >
              {ready ? 'Nueva Contraseña' : 'Enlace Inválido'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-foreground-secondary text-sm"
            >
              {ready
                ? 'Crea una contraseña segura para tu cuenta'
                : 'Este enlace no es válido o ha expirado'
              }
            </motion.p>
          </div>

          {ready ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password input con ícono */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  minLength={8}
                  className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-foreground-tertiary mt-1">
                  Mínimo 8 caracteres
                </p>
              </motion.div>

              {/* Botón con estado de carga */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                type="submit"
                disabled={isSubmitting}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <span>Actualizar contraseña</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-foreground-secondary text-center">
                Debes abrir esta página desde el enlace del email de recuperación.
              </p>
              <Link
                href="/auth/reset-password"
                className="
                  block w-full h-11
                  bg-gradient-to-r from-primary to-primary-hover
                  text-primary-foreground font-medium rounded-lg
                  shadow-lg shadow-primary/25
                  hover:shadow-xl hover:shadow-primary/40
                  hover:scale-[1.02]
                  transition-all duration-200
                  flex items-center justify-center
                "
              >
                Solicitar nuevo enlace
              </Link>
            </motion.div>
          )}

          {/* Enlace a login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

