// app/api/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // guardamos las cookies que supabase quiera setear
  const cookieJar = await cookies()
  const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieJar.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          // no escribas aún; las aplicamos al final sobre la respuesta JSON
          pendingCookies.push({ name, value, options })
        },
        remove(name: string, options: Record<string, unknown>) {
          pendingCookies.push({ name, value: '', options: { ...options, maxAge: 0 } })
        },
      },
    }
  )

  // 1) Login
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !authData.user) {
    const res = NextResponse.json({ message: error?.message || 'Credenciales inválidas' }, { status: 401 })
    // aplica cookies pendientes (si las hubiera)
    pendingCookies.forEach(c => res.cookies.set(c.name, c.value, c.options))
    return res
  }

  // 2) Rol desde DB (con tu política select_users_self_any_role)
  let role: string = 'citizen'
  const { data: userRow, error: roleErr } = await supabase
    .from('users')
    .select('uid, email, role')
    .eq('uid', authData.user.id)
    .maybeSingle()

  if (!roleErr && userRow?.role) role = userRow.role
  //console.log('LOGIN DEBUG users row:', userRow, 'error:', roleErr)
  //console.log('Rol obtenido desde BD (login):', role)

  // 3) Respuesta + cookies (sesión de supabase + sm_role)
  const res = NextResponse.json({ message: 'login_ok', role }, { status: 200 })

  // cookies de supabase (access/refresh), aplicadas a la respuesta
  pendingCookies.forEach(c => res.cookies.set(c.name, c.value, c.options))

  // cookie httpOnly con el rol como fallback para el middleware
  res.cookies.set('sm_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  })

  return res
}
