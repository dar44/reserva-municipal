'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface PublicNavbarProps {
  /** Variant controls the right-side auth buttons:
   *  - 'landing': shows Iniciar Sesión + Registrarse
   *  - 'login': no auth buttons (already on login)
   *  - 'signup': no auth buttons (already on signup)
   */
  variant?: 'landing' | 'login' | 'signup'
  /** Whether to use fixed positioning (for landing page) */
  fixed?: boolean
}

export function PublicNavbar({ variant = 'landing', fixed = false }: PublicNavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinkClass = (href: string) =>
    `h-full flex items-center justify-center px-4 my-2 rounded-none text-sm font-medium transition-all duration-300 ${
      pathname?.startsWith(href)
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm'
    }`

  const mobileLinkClass =
    'block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors'

  return (
    <nav
      className={`${
        fixed
          ? 'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm'
          : 'w-full bg-surface'
      } border-b border-border shadow-sm`}
      aria-label="Navegación principal"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            ServiMunicipal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex h-full items-center gap-3">
            <Link href="/public/recintos" className={navLinkClass('/public/recintos')}>
              Recintos
            </Link>
            <Link href="/public/cursos" className={navLinkClass('/public/cursos')}>
              Cursos
            </Link>
            <ThemeToggle />
          </div>

          {/* Right side */}
          <div className="flex h-full items-center gap-1">
            {/* Desktop auth buttons */}
            {variant === 'landing' && (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex h-full items-center justify-center px-4 rounded-none text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:flex h-full items-center justify-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Registrarse
                </Link>
              </>
            )}

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-none hover:bg-accent transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            <Link
              href="/public/recintos"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Recintos
            </Link>
            <Link
              href="/public/cursos"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Cursos
            </Link>

            {variant === 'landing' && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/login"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/signup"
                  className="block mx-4 my-2 py-3 text-sm font-semibold text-center text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
            {variant === 'login' && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/signup"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crear cuenta
                </Link>
              </>
            )}
            {variant === 'signup' && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/login"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              </>
            )}

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
