// app/api/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        },
      }
    }
  )

  // Cierra la sesión actual y, si quieres, todas las sesiones del usuario.
  await supabase.auth.signOut() // quita 'scope' si solo quieres la actual

  // Devuelve destino para que el cliente redirija.
  return NextResponse.json({ message: 'logout_ok', redirectTo: '/login' })
}
