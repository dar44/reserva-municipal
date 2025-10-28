import { ReactNode } from 'react'
import OrganizerNavBar from '@/components/OrganizerNavBar'

export const dynamic = 'force-dynamic'

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <OrganizerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}