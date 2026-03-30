///app/admin/panel/page.tsx
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, GraduationCap, Users, CalendarDays } from 'lucide-react'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function AdminPanelPage() {
  const supabase = await createSupabaseServer()

  const [recintosRes, cursosRes, usuariosRes, reservasRes] = await Promise.all([
    supabase.from('recintos').select('id', { count: 'exact', head: true }),
    supabase.from('cursos').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('uid', { count: 'exact', head: true }),
    supabase.from('reservas').select('id', { count: 'exact', head: true }),
  ])

  const recintosCount = recintosRes.count ?? 0
  const cursosCount = cursosRes.count ?? 0
  const usuariosCount = usuariosRes.count ?? 0
  const reservasCount = reservasRes.count ?? 0

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Panel de Administración</h1>
          <p className="text-foreground-secondary">
            Gestiona todos los aspectos del sistema desde este panel centralizado
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Recintos
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({recintosCount})</span>
            </CardTitle>
            <CardDescription>Administra los recintos disponibles para eventos y actividades.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/recintos">Gestionar Recintos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Cursos
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({cursosCount})</span>
            </CardTitle>
            <CardDescription>Administra los cursos disponibles y su programación.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/cursos">Gestionar Cursos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Usuarios
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({usuariosCount})</span>
            </CardTitle>
            <CardDescription>Administra los usuarios y sus permisos del sistema.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/usuarios">Gestionar Usuarios</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>
              Reservas
              <span className="ml-2 text-sm font-normal text-foreground-secondary">({reservasCount})</span>
            </CardTitle>
            <CardDescription>Consulta todas las reservas realizadas y gestiona su estado.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/reservas">Ver Reservas</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}