import Link from 'next/link'
import { LazyToastContainer } from '@/components/LazyToastContainer'
import { SignupForm } from './SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navbar de escape */}
      <nav className="w-full px-6 h-16 flex items-center justify-between border-b border-border bg-background/60 backdrop-blur-sm" aria-label="Navegación principal">
        <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" aria-label="Ir al inicio">
          <span className="text-xl font-black tracking-tight text-foreground">
            Servi<span className="text-primary font-medium">Municipal</span>
          </span>
        </Link>
        <div className="flex h-full items-center gap-1 text-sm">
          <Link href="/public/recintos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300" aria-label="Explorar recintos disponibles">Recintos</Link>
          <Link href="/public/cursos" className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300" aria-label="Explorar cursos disponibles">Cursos</Link>
          <Link href="/login" className="h-full flex items-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm" aria-label="Ir a la página de inicio de sesión">
            Iniciar sesión
          </Link>
        </div>
      </nav>

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
                aria-label="Ir a la página de inicio de sesión"
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
