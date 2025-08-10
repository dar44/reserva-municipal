// app/api/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        },
      }
    }
  )

  // Login
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 401 })
  }

  // Obtener rol desde la tabla users
  let role: string = 'citizen'
  const userUid = authData.user?.id

  if (userUid) {
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('uid, email, role')
      .eq('uid', userUid)
      .maybeSingle()
      
      console.log('LOGIN DEBUG users row:', userData, 'error:', roleError)

      if (roleError) {
      console.error('Error obteniendo rol:', roleError)
    }

    if (!roleError &&userData?.role) {
      role = userData.role
    }
  }

  console.log('Rol obtenido desde BD:', role)

  cookieStore.set({
    name: 'sm_role',
    value: role,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  })
  
  return NextResponse.json({ message: 'login_ok', role })
}
