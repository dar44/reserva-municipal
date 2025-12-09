import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizerPanelPage() {
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
      .select(`
        id,
        curso_id,
        recinto_id,
        start_at,
        end_at,
        status,
        cursos(name),
        recintos(name)
      `)
      .eq('organizer_uid', profile.uid)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const coursesCount = coursesResponse.count ?? 0
  const reservationsCount = reservationsResponse.count ?? 0
  const availableRecintos = availableRecintosResponse.count ?? 0

  type LatestReservation = {
    id: number
    curso_id: number
    recinto_id: number
    start_at: string
    end_at: string
    status: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
    cursos: { name: string } | null
    recintos: { name: string } | null
  }

  const latestReservations = (latestReservationsResponse.data ?? []) as unknown as LatestReservation[]

  // Función auxiliar para calcular la duración
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0 && diffMinutes > 0) {
      return `${diffHours}h ${diffMinutes}min`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      return `${diffMinutes}min`
    }
  }

  return (
    <div className="space-y-10 pb-8">
      {/* Sección de cabecera - Jerarquía tipográfica mejorada */}
      <section className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Panel de Organizadores
          </h1>
          <p className="text-base text-gray-400 max-w-2xl leading-relaxed">
            Bienvenido de nuevo, gestiona tus cursos y solicitudes desde este panel principal.
          </p>
        </header>

        {/* Banner informativo - Efecto glassmorphism */}
        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent backdrop-blur-sm p-6 shadow-lg shadow-emerald-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Usa la barra superior para crear cursos y gestionar tus solicitudes. Desde la sección de reservas podrás
              consultar los recintos disponibles y enviar nuevos bloques de horarios en un solo paso.
            </p>
          </div>
        </article>
      </section>

      {/* Tarjetas de estadísticas - Diseño premium con gradientes */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Tarjeta de Cursos */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-violet-700/10 to-transparent border border-violet-500/20 p-6 shadow-xl shadow-violet-500/5 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:scale-[1.02] hover:border-violet-400/30">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">
                Cursos publicados
              </h2>
              <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">📚</div>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-br from-violet-200 to-violet-400 bg-clip-text text-transparent">
              {coursesCount}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gestiona tus programas desde la sección de cursos.
            </p>
          </div>
        </div>

        {/* Tarjeta de Solicitudes */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-transparent border border-blue-500/20 p-6 shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.02] hover:border-blue-400/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-300/80">
                Solicitudes enviadas
              </h2>
              <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">📋</div>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-br from-blue-200 to-blue-400 bg-clip-text text-transparent">
              {reservationsCount}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consulta el estado de cada solicitud en la vista de reservas.
            </p>
          </div>
        </div>

        {/* Tarjeta de Recintos */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-emerald-700/10 to-transparent border border-emerald-500/20 p-6 shadow-xl shadow-emerald-500/5 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] hover:border-emerald-400/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
                Recintos disponibles
              </h2>
              <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">🏢</div>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              {availableRecintos}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consulta la lista actualizada en la sección de reservas.
            </p>
          </div>
        </div>
      </section>

      {/* Últimas solicitudes - Diseño de lista mejorado con más contexto */}
      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Últimas Solicitudes</h2>
          <p className="text-sm text-gray-400">
            Resumen de las últimas peticiones enviadas.
          </p>
        </div>

        {latestReservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700/50 bg-gray-900/30 p-12 text-center">
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <p className="text-sm text-gray-500">Todavía no has enviado solicitudes de reserva.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {latestReservations.map(reservation => {
              const startDate = reservation.start_at ? new Date(reservation.start_at) : null
              const endDate = reservation.end_at ? new Date(reservation.end_at) : null
              const cursoName = reservation.cursos?.name || 'Curso desconocido'
              const recintoName = reservation.recintos?.name || 'Recinto desconocido'
              const duration = startDate && endDate ? calculateDuration(reservation.start_at, reservation.end_at) : null

              // Configuración de badges de estado
              const statusConfig = {
                aprobada: {
                  bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
                  text: 'text-white',
                  shadow: 'shadow-lg shadow-emerald-500/20',
                  icon: '✓'
                },
                rechazada: {
                  bg: 'bg-gradient-to-r from-red-500 to-red-600',
                  text: 'text-white',
                  shadow: 'shadow-lg shadow-red-500/20',
                  icon: '✕'
                },
                cancelada: {
                  bg: 'bg-gradient-to-r from-gray-600 to-gray-700',
                  text: 'text-white',
                  shadow: 'shadow-lg shadow-gray-500/20',
                  icon: '○'
                },
                pendiente: {
                  bg: 'bg-gradient-to-r from-amber-400 to-amber-500',
                  text: 'text-gray-900',
                  shadow: 'shadow-lg shadow-amber-500/20',
                  icon: '⏱'
                }
              }

              const config = statusConfig[reservation.status as keyof typeof statusConfig] || statusConfig.pendiente

              return (
                <li key={reservation.id}>
                  <Link
                    href="/organizer/reservas"
                    className="group relative block overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative space-y-3">
                      {/* Cabecera con curso y estado */}
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            <h3 className="text-base font-bold text-gray-100">
                              {cursoName}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500">
                            Solicitud #{reservation.id}
                          </p>
                        </div>

                        <span className={`
                          self-start
                          inline-flex items-center gap-2
                          rounded-lg px-3 py-1.5
                          text-xs font-semibold uppercase tracking-wide
                          ${config.bg} ${config.text} ${config.shadow}
                          transition-all duration-300
                          group-hover:scale-105
                        `}>
                          <span>{config.icon}</span>
                          <span>{reservation.status}</span>
                        </span>
                      </div>

                      {/* Grid de detalles */}
                      <div className="grid gap-2 text-xs md:grid-cols-3">
                        {/* Recinto */}
                        <div className="flex items-start gap-2">
                          <span className="text-base opacity-60">🏢</span>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Recinto</span>
                            <span className="font-medium text-gray-300">{recintoName}</span>
                          </div>
                        </div>

                        {/* Fecha y hora */}
                        <div className="flex items-start gap-2">
                          <span className="text-base opacity-60">📅</span>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Fecha y hora</span>
                            <span className="font-medium text-gray-300">
                              {startDate && !Number.isNaN(startDate.getTime())
                                ? startDate.toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Duración */}
                        <div className="flex items-start gap-2">
                          <span className="text-base opacity-60">⏱</span>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Duración</span>
                            <span className="font-medium text-gray-300">
                              {duration || '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Indicador de hover */}
                      <div className="flex items-center gap-1.5 text-xs text-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span>Ver detalles</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}