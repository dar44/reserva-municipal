'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Card con glassmorphism sutil */}
        <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2"
            >
              ServiMunicipal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-foreground-secondary text-sm"
            >
              Gestión inteligente de servicios municipales
            </motion.p>
          </div>

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
                placeholder="Contraseña"
                required
                className="input-base pl-11 transition-all duration-200 focus:scale-[1.01]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </motion.div>

            {/* Botón con estado de carga */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
            </motion.button>
          </form>

          {/* Enlaces secundarios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-3"
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
