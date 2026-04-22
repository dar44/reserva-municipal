import Link from 'next/link'
import type { Metadata } from 'next'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { LoginForm } from './LoginForm'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Iniciar Sesión · ServiMunicipal',
  description: 'Accede a tu cuenta en ServiMunicipal para gestionar tus reservas de espacios y cursos municipales.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <PublicNavbar variant="login" />

      <main className="flex-1 flex items-center justify-center p-4" id="main-content">
        <div className="w-full max-w-md">
          {/* Card con glassmorphism sutil */}
          <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2">
                ServiMunicipal
              </h1>
              <p className="text-foreground-secondary text-sm">
                Gestión inteligente de servicios municipales
              </p>
            </div>

            <LoginForm />

            {/* Enlaces secundarios */}
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/reset-password"
                className="block text-center text-sm text-primary hover:text-primary-hover transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              <div className="relative" role="separator" aria-hidden="true">
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
      </main>
      <LazyToastContainer />
    </div>
  )
}
