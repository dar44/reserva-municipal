// app/public/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border bg-surface shadow-sm">
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
              <NavLink href="/public/recintos">Recintos</NavLink>
              <NavLink href="/public/cursos">Cursos</NavLink>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-4 container mx-auto">{children}</main>

      <footer className="py-6 px-4 border-t border-border bg-surface/50 text-center">
        <p className="text-sm text-foreground-secondary">
          © 2025 ServiMunicipal. Sistema de gestión de reservas municipales.
        </p>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="h-full flex items-center justify-center px-4 my-2 rounded-md text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
    >
      {children}
    </Link>
  )
}
