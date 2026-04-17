import { ReactNode } from 'react'
import { requireAuthRSC } from '@/lib/auth/guard'
import OrganizerNavBar from '@/components/OrganizerNavBar'
import { LazyToastContainer } from '@/components/LazyToastContainer'

export const dynamic = 'force-dynamic'

export default async function OrganizerLayout({ children }: { children: ReactNode }) {
  await requireAuthRSC(['admin', 'organizer'])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <OrganizerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
      <LazyToastContainer />
    </div>
  )
}