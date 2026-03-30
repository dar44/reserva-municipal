// app/organizer/panel/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Building2, FileText, CalendarCheck } from 'lucide-react'

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

  const statusClass: Record<string, string> = {
    aprobada: 'bg-success text-success-foreground',
    rechazada: 'bg-error text-error-foreground',
    cancelada: 'bg-muted text-muted-foreground',
    pendiente: 'bg-warning text-warning-foreground',
  }

  return (
    <div className="container-padding section-spacing">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Panel de Organizadores</h1>
          <p className="text-foreground-secondary">
            Gestiona tus cursos, solicitudes de recintos y reservas desde este panel
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Recintos
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({availableRecintos})</span>
            </CardTitle>
            <CardDescription>Consulta los recintos disponibles y envía nuevas solicitudes de reserva.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/organizer/recintos">Ver Recintos</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Mis Cursos
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({coursesCount})</span>
            </CardTitle>
            <CardDescription>Gestiona tus programas y crea nuevos cursos para los ciudadanos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/organizer/cursos">Ver Cursos</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Solicitudes
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({reservationsCount})</span>
            </CardTitle>
            <CardDescription>Consulta el estado de las solicitudes de recintos enviadas.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/organizer/solicitudes">Ver Solicitudes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Latest reservations */}
      <div className="mt-10 space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Últimas Solicitudes</h2>
          <p className="text-sm text-foreground-secondary">
            Resumen de las últimas peticiones enviadas.
          </p>
        </div>

        {latestReservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-12 text-center">
            <p className="text-sm text-foreground-secondary">Todavía no has enviado solicitudes de reserva.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {latestReservations.map(reservation => {
              const startDate = reservation.start_at ? new Date(reservation.start_at) : null
              const endDate = reservation.end_at ? new Date(reservation.end_at) : null
              const cursoName = reservation.cursos?.name || 'Curso desconocido'
              const recintoName = reservation.recintos?.name || 'Recinto desconocido'
              const duration = startDate && endDate ? calculateDuration(reservation.start_at, reservation.end_at) : null
              const config = statusClass[reservation.status] ?? statusClass.pendiente

              return (
                <li key={reservation.id}>
                  <Link
                    href="/organizer/solicitudes"
                    className="group relative block overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface/50 to-surface/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative space-y-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-1">
                          <h3 className="text-base font-bold text-foreground">{cursoName}</h3>
                          <p className="text-xs text-foreground-secondary">Solicitud #{reservation.id}</p>
                        </div>

                        <span className={`self-start inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${config}`}>
                          {reservation.status}
                        </span>
                      </div>

                      <div className="grid gap-2 text-xs md:grid-cols-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col">
                            <span className="text-foreground-secondary">Recinto</span>
                            <span className="font-medium text-foreground">{recintoName}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="flex flex-col">
                            <span className="text-foreground-secondary">Fecha y hora</span>
                            <span className="font-medium text-foreground">
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

                        <div className="flex items-start gap-2">
                          <div className="flex flex-col">
                            <span className="text-foreground-secondary">Duración</span>
                            <span className="font-medium text-foreground">{duration || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
      </div>
    </div>
  )
}