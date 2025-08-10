//app/admin/layout.tsx
import { ReactNode } from 'react'
import AdminNavBar from '@/components/AdminNavBar'
import { requireRole } from '../../lib/auth/requireRole'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole({ allowed: ['admin'] })
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <AdminNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
