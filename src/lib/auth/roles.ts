import type { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export type AppRole = 'admin' | 'worker' | 'citizen' | 'organizer'

export interface SessionProfile {
  uid: string
  role: AppRole
}

export class AuthorizationError extends Error {
  status: number

  constructor(message: string, status = 403) {
    super(message)
    this.name = 'AuthorizationError'
    this.status = status
  }
}

export async function getSessionProfile (supabase: SupabaseClient): Promise<SessionProfile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')

  }

  const { data, error } = await supabase
    .from('users')
    .select('uid, role')
    .eq('uid', user.id)
    .maybeSingle()

  if (error || !data) {
    throw new AuthorizationError('No se encontró el perfil del usuario', 401)
  }

  return {
    uid: data.uid,
    role: data.role as AppRole,
  }
}

export function assertRole (profile: SessionProfile, allowed: AppRole[]): void {
  if (!allowed.includes(profile.role)) {
    throw new AuthorizationError('Permisos insuficientes', 403)
  }
}

export function isRole (profile: SessionProfile, ...roles: AppRole[]): boolean {
  return roles.includes(profile.role)
}