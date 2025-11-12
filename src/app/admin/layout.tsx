// app/admin/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import AdminNavBar from '@/components/AdminNavBar'
import { getSessionProfile, assertRole } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Cliente Supabase SSR leyendo cookies de la request
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookieStore).get(name)?.value,
        set: async (name: string, value: string, options: Record<string, unknown>) => {
          (await cookieStore).set(name, value, options as any)
        },
        remove: async (name: string, options: Record<string, unknown>) => {
          (await cookieStore).set(name, '', { ...(options as any), maxAge: 0 })
        },
      },
    }
  )

  // 1) Requerir sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2) Requerir rol admin
  try {
    const profile = await getSessionProfile(supabase) // lee uid/role desde tu tabla users
    assertRole(profile, ['admin'])
  } catch {
    redirect('/login') // o a una /403 si prefieres
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <AdminNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
