import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set(['/', '/login', '/signup'])
const PUBLIC_PREFIXES = ['/public', '/api']
const ASSET_PREFIXES = ['/_next', '/static', '/favicon.ico', '/images', '/fonts']

function isAssetPath(pathname: string) {
  return ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix)) || /\.[^/]+$/.test(pathname)
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true
  }
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function buildLoginRedirect(req: NextRequest) {
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`
  if (nextPath && nextPath !== '/login') {
    loginUrl.searchParams.set('next', nextPath)
  }
  return NextResponse.redirect(loginUrl)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isAssetPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for sm_role cookie (set by login API) or any Supabase cookie
  const hasRoleCookie = req.cookies.get('sm_role')
  const hasSupabaseCookie = Array.from(req.cookies.getAll()).some(cookie =>
    cookie.name.startsWith('sb-') || cookie.name.includes('auth-token')
  )

  if (!hasRoleCookie && !hasSupabaseCookie) {
    return buildLoginRedirect(req)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(.*)'],
}