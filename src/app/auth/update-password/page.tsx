import { Suspense } from 'react'
import UpdatePasswordClient from './UpdatePasswordClient'

/** Evita el prerender/SSG: esta página debe renderizarse en runtime */
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Cargando…</p>}>
      <UpdatePasswordClient />
    </Suspense>
  )
}
