import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function OrganizerPanelPage () {
  const supabase = await createSupabaseServer()
  const profile = await getSessionProfile(supabase)

  const [coursesResponse, reservationsResponse, availableRecintosResponse, latestReservationsResponse] = await Promise.all([
    supabase
      .from('cursos')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_uid', profile.uid),
    supabase
      .from('curso_reservas')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_uid', profile.uid),
    supabase
      .from('recintos')
      .select('id', { count: 'exact', head: true })
      .eq('state', 'Disponible'),
    supabase
      .from('curso_reservas')
      .select('id,start_at,end_at,status', { count: 'exact' })
      .eq('organizer_uid', profile.uid)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const coursesCount = coursesResponse.count ?? 0
  const reservationsCount = reservationsResponse.count ?? 0
  const availableRecintos = availableRecintosResponse.count ?? 0
  const latestReservations = latestReservationsResponse.data ?? []

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold">Panel de organizadores</h1>
          <p className="text-sm text-gray-400">
            Bienvenido de nuevo, gestiona tus cursos y solicitudes desde este panel principal.
          </p>
        </header>

        <article className="rounded border border-emerald-500 bg-emerald-50/80 p-4 text-sm text-emerald-900">
          <p>
            Usa la barra superior para crear cursos y gestionar tus solicitudes. Desde la sección de reservas podrás
            consultar los recintos disponibles y enviar nuevos bloques de horarios en un solo paso.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <h2 className="text-sm uppercase text-gray-400">Cursos publicados</h2>
          <p className="mt-2 text-3xl font-semibold">{coursesCount}</p>
          <p className="mt-2 text-xs text-gray-400">Gestiona tus programas desde la sección de cursos.</p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <h2 className="text-sm uppercase text-gray-400">Solicitudes enviadas</h2>
          <p className="mt-2 text-3xl font-semibold">{reservationsCount}</p>
          <p className="mt-2 text-xs text-gray-400">Consulta el estado de cada solicitud en la vista de reservas.</p>
        </div>
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <h2 className="text-sm uppercase text-gray-400">Recintos disponibles</h2>
          <p className="mt-2 text-3xl font-semibold">{availableRecintos}</p>
          <p className="mt-2 text-xs text-gray-400">Consulta la lista actualizada en la sección de reservas.</p>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Últimas solicitudes</h2>
          <p className="text-sm text-gray-400">Resumen de las últimas peticiones enviadas.</p>
        </div>
        {latestReservations.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no has enviado solicitudes de reserva.</p>
        ) : (
          <ul className="space-y-2">
            {latestReservations.map(reservation => {
              const startDate = reservation.start_at ? new Date(reservation.start_at) : null
              const endDate = reservation.end_at ? new Date(reservation.end_at) : null
              return (
                <li key={reservation.id} className="rounded border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <span className="font-medium uppercase tracking-wide text-xs text-gray-400">Solicitud #{reservation.id}</span>
                    <span className={`self-start rounded px-2 py-0.5 text-xs uppercase ${
                      reservation.status === 'aprobada'
                        ? 'bg-green-700 text-white'
                        : reservation.status === 'rechazada'
                          ? 'bg-red-700 text-white'
                          : reservation.status === 'cancelada'
                            ? 'bg-gray-700 text-white'
                            : 'bg-yellow-600 text-black'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>
                      Inicio:{' '}
                      {startDate && !Number.isNaN(startDate.getTime())
                        ? startDate.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                        : '—'}
                    </p>
                    <p>
                      Fin:{' '}
                      {endDate && !Number.isNaN(endDate.getTime())
                        ? endDate.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                        : '—'}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}