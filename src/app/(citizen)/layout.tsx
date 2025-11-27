// app/(citizen)/layout.tsx
import { ReactNode } from 'react'
import { NavBar } from '@/components/NavBar'
import { requireAuthRSC } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  await requireAuthRSC()

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}