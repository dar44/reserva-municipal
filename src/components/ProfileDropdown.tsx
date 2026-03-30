// components/ProfileDropdown.tsx
'use client'

import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
}

export default function ProfileDropdown({ onClose }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' })
    const body = await res.json().catch(() => ({}))
    window.location.href = body?.redirectTo || '/login'
  }

  const handleViewProfile = () => {
    onClose()
    router.push('/perfil')
  }

  return (
    <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-md z-[var(--z-dropdown)] py-1">
      <button
        type="button"
        onClick={handleViewProfile}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Ver perfil
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-error-subtle transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
