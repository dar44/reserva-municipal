import { ReactNode } from 'react'
import WorkerNavBar from '@/components/WorkerNavBar'
import { requireAuthRSC } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  await requireAuthRSC(['admin', 'worker'])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <WorkerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}