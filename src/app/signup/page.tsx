import Link from 'next/link'
import type { Metadata } from 'next'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { SignupForm } from './SignupForm'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Crear cuenta · ServiMunicipal',
  description: 'Regístrate en ServiMunicipal y gestiona tus reservas de espacios y cursos municipales de forma rápida y sencilla.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <PublicNavbar variant="signup" />

      <main className="flex-1 flex items-center justify-center p-4" id="main-content">
        <div className="w-full max-w-2xl">
          {/* Card con glassmorphism */}
          <div className="surface rounded-2xl shadow-2xl p-8 border border-border backdrop-blur-sm">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-2">
                Crear Cuenta
              </h1>
              <p className="text-foreground-secondary text-sm">
                Únete a ServiMunicipal y gestiona tus reservas
              </p>
            </div>

            <SignupForm />

            {/* Enlaces secundarios */}
            <div className="mt-6 text-center">
              <div className="relative mb-4" role="separator" aria-hidden="true">
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
      </main>
      <LazyToastContainer />
    </div>
  )
}
