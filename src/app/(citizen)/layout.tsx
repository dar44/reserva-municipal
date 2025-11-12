// app/(citizen)/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NavBar } from '@/components/NavBar'

export const dynamic = 'force-dynamic' // evita SSG/ISR

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  // Supabase SSR en RSC
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
          // Para layout basta con bloquear; no necesitamos set en este punto
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
    // redirijo a login
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  )
}
