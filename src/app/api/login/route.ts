import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          )
        }
      }
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ message: error.message }, { status: 401 })

  return NextResponse.json({ message: 'login_ok' })
}

export const dynamic = 'force-dynamic'