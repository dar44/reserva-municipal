import Link from 'next/link'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <nav className="w-full border-b border-border bg-background/60 backdrop-blur-sm" aria-label="Navegación principal">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" aria-label="Inicio">
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
