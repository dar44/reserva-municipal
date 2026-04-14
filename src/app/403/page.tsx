import Link from 'next/link'

import { requireAuthRSC } from '@/lib/auth/guard'
import type { AppRole } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

const homeByRole: Record<AppRole, string> = {
  admin: '/admin',
  citizen: '/recintos',
  worker: '/worker/panel',
  organizer: '/organizer/panel',
}

export default async function ForbiddenPage() {
  const {
    profile: { role },
  } = await requireAuthRSC()
  const homeHref = homeByRole[role] ?? '/'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md text-center space-y-6 p-8 border border-border rounded-lg">
        <h1 className="text-3xl font-semibold">No tienes permisos suficientes</h1>
        <p className="text-sm text-foreground-secondary">
          Tu cuenta no cuenta con los permisos necesarios para acceder a esta sección. Si crees que es un error, contacta con un administrador.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition"
          >
            Volver al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition"
          >
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  )
}