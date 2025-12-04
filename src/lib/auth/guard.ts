import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AppRole, SessionProfile } from './roles'
import { AuthorizationError, getSessionProfile } from './roles'

type SupabaseAnyClient = SupabaseClient<any, any, any>

export interface RequireAuthRSCResult {
  supabase: SupabaseAnyClient
  profile: SessionProfile
}

export type RequireAuthAPIResult =
  | { supabase: SupabaseAnyClient; profile: SessionProfile }
  | { error: Response }

export const ACCESS_RULES: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/worker', roles: ['admin', 'worker'] },
  { prefix: '/organizer', roles: ['admin', 'organizer'] },
  { prefix: '/citizen', roles: ['admin', 'citizen', 'worker', 'organizer'] },
]

export function allowedRolesFor(pathname: string): AppRole[] | null {
  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
  for (const { prefix, roles } of ACCESS_RULES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return roles
    }
  }
  return null
}

function createSupabaseForRSC(): SupabaseAnyClient {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookieStore).get(name)?.value,
        set: () => undefined,
        remove: () => undefined,
      },
    },
  )
}

export async function requireAuthRSC(allowed?: AppRole[]): Promise<RequireAuthRSCResult> {
  const supabase = createSupabaseForRSC()
  try {
    const profile = await getSessionProfile(supabase)
    if (allowed && !allowed.includes(profile.role)) {
      redirect('/403')
    }
    return { supabase, profile }
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) {
      redirect('/login')
    }
    throw error
  }
}

async function fetchProfile(
  supabase: SupabaseAnyClient,
): Promise<SessionProfile | { error: Response }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }
  const { data, error } = await supabase
    .from('users')
    .select('uid, role')
    .eq('uid', user.id)
    .maybeSingle()
  if (error || !data) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }
  return {
    uid: data.uid,
    role: data.role as AppRole,
  }
}

export async function requireAuthAPI(allowed?: AppRole[]): Promise<RequireAuthAPIResult> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookieStore).get(name)?.value,
        set: () => undefined,
        remove: () => undefined,
      },
    },
  )
  const profileResult = await fetchProfile(supabase)
  if ('error' in profileResult) {
    return { error: profileResult.error as Response }
  }
  if (allowed && !allowed.includes(profileResult.role)) {
    return { error: new Response('Forbidden', { status: 403 }) }
  }
  return { supabase, profile: profileResult }
}

export async function requireByPathRSC(pathname: string, fallbackRoles?: AppRole[]): Promise<RequireAuthRSCResult> {
  const allowed = allowedRolesFor(pathname) ?? fallbackRoles
  return requireAuthRSC(allowed ?? undefined)
}