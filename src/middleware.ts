// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'


export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: name => req.cookies.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const role = session?.user.app_metadata.role ?? 'anon'
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (path.startsWith('/worker') && !['admin','worker'].includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (path.startsWith('/dashboard') && role === 'anon') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|api|favicon.ico).*)'] }
// This middleware checks the user's role and redirects them accordingly based on the requested path.
// It ensures that only admins can access admin routes, workers can access worker routes, and anonymous users are redirected to the login page when trying to access the dashboard. 
// The matcher excludes Next.js internals like _next, api routes, and favicon.ico from being processed by this middleware.