//(ctizen)/layout.tsx
import { ReactNode } from 'react'
import { NavBar } from '@/components/NavBar'
// Update the import path below if the actual location is different
import { requireRole } from '../../lib/auth/requireRole'

export const dynamic = 'force-dynamic'

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  await requireRole({ allowed: ['citizen', 'admin', 'worker'] })
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
