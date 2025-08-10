// components/ProfileDropdown.tsx
'use client'

interface Props {
  onClose: () => void
  onViewProfile: () => void
}

export default function ProfileDropdown({ onClose, onViewProfile }: Props) {
  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' })
    const body = await res.json().catch(() => ({}))
    // redirige según lo que diga el servidor (fallback a /login)
    window.location.href = body?.redirectTo || '/login'
  }

  return (
    <div className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded shadow z-10 py-2">
      <button
        onClick={() => { onClose(); onViewProfile() }}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Ver perfil
      </button>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
