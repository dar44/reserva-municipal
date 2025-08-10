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
const go = (to: string) => NextResponse.redirect(new URL(to, req.url))

  // Públicas básicas (NO /login para poder reenviar a panel si ya hay sesión)
  if (path === '/' || path.startsWith('/public') || path.startsWith('/signup')) {
    return res
  }

  // Sesión
  const { data: { user } } = await supabase.auth.getUser()

  // 🔒 Bloquea zonas protegidas si no hay sesión
  const isAdminArea  = path.startsWith('/admin')  || path.startsWith('/api/admin')
  const isWorkerArea = path.startsWith('/worker') || path.startsWith('/api/worker')

  if (!user) {
    if (isAdminArea || isWorkerArea) return go('/login')
    // /recintos, /cursos, etc. públicas/mixtas → deja pasar
    return res
  }

  // 🔎 Rol SIEMPRE desde BD (fuente única)
  let role: 'admin' | 'worker' | 'citizen' | null = null
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('uid', user.id)
    .maybeSingle()
  role = (data?.role as any) ?? null

  // 🚧 Guardas por rol
  if (isAdminArea && role !== 'admin') return go('/login')
  if (isWorkerArea && !(role === 'admin' || role === 'worker')) return go('/login')

  // ✅ Si el usuario ya está logueado y entra a /login → llévalo a su panel
  if (path.startsWith('/login')) {
    if (role === 'admin')  return go('/admin/panel')
    if (role === 'worker') return go('/worker/panel')
    return go('/recintos') // citizen
  }

  return res
}

// Protege páginas y (opcional) APIs por namespaces /api/admin y /api/worker
export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|fonts|images).*)',
  ],
}