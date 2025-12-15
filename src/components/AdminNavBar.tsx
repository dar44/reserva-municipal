///components/AdminNavBar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import ProfileDropdown from './ProfileDropdown'
import ProfileModal from './ProfileModal'
import { ThemeToggle } from './ThemeToggle'

export default function AdminNavBar() {
  const pathname = usePathname()
  const linkClass = (href: string) =>
    `px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${pathname.startsWith(href)
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground-secondary hover:bg-accent hover:text-accent-foreground"
    }`

  const [profileName, setProfileName] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      const userUid = user?.id
      if (!userUid) return
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('uid', userUid)
        .single()
      if (data?.name) setProfileName(data.name)
    }
    loadUser()
  }, [])

  return (
    <>
      <nav className="border-b border-border bg-surface shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin/panel" className="text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
              ServiMunicipal
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/admin/panel" className={linkClass('/admin/panel')}>Panel</Link>
              <Link href="/admin/recintos" className={linkClass('/admin/recintos')}>Recintos</Link>
              <Link href="/admin/cursos" className={linkClass('/admin/cursos')}>Cursos</Link>
              <Link href="/admin/usuarios" className={linkClass('/admin/usuarios')}>Usuarios</Link>
              <Link href="/admin/reservas" className={linkClass('/admin/reservas')}>Reservas</Link>
              <ThemeToggle />
            </div>

            {/* Right side: Profile dropdown + Mobile menu button */}
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent"
                >
                  {profileName || ''} <span className="text-xs">▾</span>
                </button>
                {menuOpen && (
                  <ProfileDropdown
                    onClose={() => setMenuOpen(false)}
                    onViewProfile={() => setProfileOpen(true)}
                  />
                )}
              </div>

              {/* Mobile Menu Button - Only visible on mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-1">
              <Link
                href="/admin/panel"
                className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Panel
              </Link>
              <Link
                href="/admin/recintos"
                className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recintos
              </Link>
              <Link
                href="/admin/cursos"
                className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link
                href="/admin/usuarios"
                className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Usuarios
              </Link>
              <Link
                href="/admin/reservas"
                className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reservas
              </Link>

              {/* Theme toggle in mobile menu */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggle />
              </div>

              {/* User info in mobile menu */}
              {profileName && (
                <div className="px-4 py-3 mt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setProfileOpen(true)
                    }}
                    className="text-sm text-foreground-secondary hover:text-foreground w-full text-left"
                  >
                    {profileName}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          onUpdated={setProfileName}
        />
      )}
    </>
  )
}
