// app/public/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ThemeToggle = dynamic(
  () => import('@/components/ThemeToggle').then((mod) => mod.ThemeToggle)
);

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border bg-surface shadow-sm" aria-label="Navegación principal">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              aria-label="Ir al inicio"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Servi<span className="text-primary font-medium">Municipal</span>
              </span>
            </Link>

            <div className="hidden md:flex h-full items-center gap-3">
              <NavLink href="/public/recintos" aria-label="Explorar recintos disponibles">Recintos</NavLink>
              <NavLink href="/public/cursos" aria-label="Explorar cursos disponibles">Cursos</NavLink>
              <ThemeToggle />
            </div>

            <div className="flex h-full items-center gap-1">
              <Link
                href="/login"
                className="h-full flex items-center px-4 rounded-none text-sm font-medium text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm transition-all duration-300"
                aria-label="Ir a la página de inicio de sesión"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="h-full flex items-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm"
                aria-label="Crear una cuenta nueva"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-4 container mx-auto" id="main-content">{children}</main>

      <footer className="py-6 px-4 border-t border-border bg-surface/50 text-center" role="contentinfo">
        <p className="text-sm text-foreground-secondary">
          © 2025 ServiMunicipal. Sistema de gestión de reservas municipales.
        </p>
      </footer>
    </div>
  )
}

function NavLink({ href, children, 'aria-label': ariaLabel }: { href: string; children: ReactNode; 'aria-label'?: string }) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="h-full flex items-center justify-center px-4 rounded-none text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
    >
      {children}
    </Link>
  )
}
