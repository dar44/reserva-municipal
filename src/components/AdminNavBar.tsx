///components/AdminNavBar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/admin/panel" className="text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
            ServiMunicipal
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin/panel" className={linkClass('/admin/panel')}>Panel</Link>
            <Link href="/admin/recintos" className={linkClass('/admin/recintos')}>Recintos</Link>
            <Link href="/admin/cursos" className={linkClass('/admin/cursos')}>Cursos</Link>
            <Link href="/admin/usuarios" className={linkClass('/admin/usuarios')}>Usuarios</Link>
            <Link href="/admin/reservas" className={linkClass('/admin/reservas')}>Reservas</Link>
            <ThemeToggle />
          </div>
          <div className="relative">
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
