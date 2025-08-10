// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // SIEMPRE crea un NextResponse base
  const res = NextResponse.next()
  const path = req.nextUrl.pathname

  // Cliente supabase con handlers de cookies mínimos (get/set/remove)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          // Escribimos en la respuesta (no tocamos req.cookies)
          res.cookies.set(name, value, options)
        },
        remove: (name: string, options: any) => {
          res.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // Helper redirect SIN copiar cookies manualmente
  const go = (to: string) => NextResponse.redirect(new URL(to, req.url))

  // 1) Rutas públicas (no incluimos /login aquí para poder reenviar si ya estás logueado)
  if (path.startsWith('/signup') || path === '/' || path.startsWith('/public')) {
    return res
  }

  // 2) Sesión actual
  const { data: { user }, error: getUserErr } = await supabase.auth.getUser()
  if (getUserErr) console.log('MW getUserErr:', getUserErr)

  // 3) Si NO hay sesión y entras a zonas protegidas → /login
  if (!user) {
    const cookieRole = req.cookies.get('sm_role')?.value
    if (path.startsWith('/admin')) {
      if (cookieRole === 'admin') return res
      console.log('MW: no user → redirect /login | path:', path)
      return go('/login')
    }
    if (path.startsWith('/worker')) {
      if (cookieRole === 'admin' || cookieRole === 'worker') return res
      console.log('MW: no user → redirect /login | path:', path)
      return go('/login')
    }
    return res
  }

  // 4) Con sesión → leer rol desde DB (RLS: select_users_self_any_role)
  let role: string | null = null
  let selectErr: any = null
  if (user.id) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('uid', user.id)
      .maybeSingle()
    role = data?.role || null
    selectErr = error || null
  }

  // 5) Fallback por cookie httpOnly si no tenemos rol por DB
  const cookieRole = req.cookies.get('sm_role')?.value || null
  if (!role && cookieRole) {
    console.log('MW: usando cookie sm_role como fallback:', cookieRole)
    role = cookieRole
  }

  console.log('MW path:', path, '| user.id:', user?.id, '| role:', role, '| selectErr:', selectErr)

  // 6) Guardas de acceso
  if (path.startsWith('/admin') && role !== 'admin') {
    console.log('MW: acceso denegado /admin para rol:', role)
    return go('/login')
  }
  if (path.startsWith('/worker') && !(role === 'admin' || role === 'worker')) {
    console.log('MW: acceso denegado /worker para rol:', role)
    return go('/login')
  }

  // 7) Si ya estás logueado y caes en /login → te mando a tu panel
  if (path.startsWith('/login')) {
    if (role === 'admin') return go('/admin/panel')
    if (role === 'worker') return go('/worker/panel')
    return go('/recintos') // citizen/otros
  }

  // 8) Devolver la respuesta base (con cookies que haya seteado supabase)
  return res
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|fonts|images|api).*)'],
}
