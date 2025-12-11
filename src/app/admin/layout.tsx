// app/admin/layout.tsx
import { ReactNode } from 'react'
import AdminNavBar from '@/components/AdminNavBar'
import { requireAuthRSC } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAuthRSC(['admin'])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AdminNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
