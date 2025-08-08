// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata.role ?? 'anon'
  const path = req.nextUrl.pathname

  const redirectResponse = (pathname: string) => {
    const url = new URL(pathname, req.url)
    const response = NextResponse.redirect(url)
    res.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
    return response
  }

  if (path.startsWith('/admin') && role !== 'admin') {
    return redirectResponse('/dashboard')
  }
  if (path.startsWith('/worker') && !['admin','worker'].includes(role)) {
    return redirectResponse('/dashboard')
  }
  if (path.startsWith('/dashboard') && role === 'anon') {
    return redirectResponse('/login')
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|api|favicon.ico).*)'] }
