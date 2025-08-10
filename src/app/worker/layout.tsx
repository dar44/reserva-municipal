import { ReactNode } from 'react'
import WorkerNavBar from '@/components/WorkerNavBar'
import { requireRole } from '../../lib/auth/requireRole'

export const dynamic = 'force-dynamic'

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  await requireRole({ allowed: ['admin', 'worker'] })
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <WorkerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
 