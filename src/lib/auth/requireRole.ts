// /lib/auth/requireRole.ts
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'

export type AppRole = 'admin' | 'worker' | 'citizen'

type RequireRoleOpts = {
  allowed: AppRole[]                       // roles que pueden pasar
  redirectTo?: string                      // destino si no cumple
}

/**
 * Valida sesión y rol en SSR. Redirige si no cumple.
 * Devuelve el user y el role (resuelto desde JWT o tabla users).
 */
export async function requireRole(opts: RequireRoleOpts) {
  const { allowed, redirectTo = '/login' } = opts
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(redirectTo)

  // 1) Intento rápido: app_metadata.role en el JWT
  let role = (user.app_metadata as any)?.role as AppRole | undefined

  // 2) Fallback: consulta tabla users si el JWT no trae role
  if (!role) {
    const { data: row, error } = await supabase
      .from('users')
      .select('role')
      .eq('uid', user.id)
      .maybeSingle()

    if (error) {
      // Si falla la consulta, también redirigimos por seguridad
      redirect(redirectTo)
    }
    role = row?.role as AppRole | undefined
  }

  if (!role || !allowed.includes(role)) {
    redirect(redirectTo)
  }

  return { user, role, supabase }
}

/**
 * Si solo necesitas saber user/role sin bloquear (p.ej. navbar),
 * usa esta variante que nunca redirige.
 */
export async function getUserAndRole() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let role = (user?.app_metadata as any)?.role as AppRole | undefined
  if (!role && user?.id) {
    const { data } = await supabase.from('users').select('role').eq('uid', user.id).maybeSingle()
    role = (data?.role as AppRole) || role
  }
  return { user, role, supabase }
}
