// app/(worker)/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import WorkerNavBar from '@/components/WorkerNavBar'
import { cookies } from 'next/headers'
import { getSessionProfile, assertRole } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  // Creamos cliente Supabase SSR leyendo cookies de la request
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: Record<string, unknown>) {
          (await cookieStore).set(name, value, options as any)
        },
        async remove(name: string, options: Record<string, unknown>) {
          (await cookieStore).set(name, '', { ...(options as any), maxAge: 0 })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login') 
  }

  try {
    const profile = await getSessionProfile(supabase)   // lee uid/role de tu tabla users
    assertRole(profile, ['admin', 'worker'])
  } catch {
    //redirijo a login
    redirect('/login')
  }

  //  Render UI ya lo cambiaré mas adelanbte
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <WorkerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
