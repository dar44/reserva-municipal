import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import AdminNavBar from '@/components/AdminNavBar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout ({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServer()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const appUserId = (user.app_metadata as { user_id?: string })?.user_id
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq(appUserId ? 'id' : 'email', appUserId ?? user.email!)
    .single()
  if (data?.role !== 'admin') redirect('/recintos')

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <AdminNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}