import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set(['/', '/login', '/signup'])
const PUBLIC_PREFIXES = ['/public', '/api/auth']
const ASSET_PREFIXES = ['/_next', '/static', '/favicon.ico', '/images', '/fonts']
const AUTH_COOKIE_NAMES = ['sb-access-token', 'sb-refresh-token', 'sb:token']

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

  const hasAuthCookie = AUTH_COOKIE_NAMES.some(name => req.cookies.get(name))
  if (!hasAuthCookie) {
    return buildLoginRedirect(req)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(.*)'],
}