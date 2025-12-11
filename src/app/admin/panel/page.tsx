///app/admin/panel/page.tsx
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
export const dynamic = 'force-dynamic'

export default async function AdminPanelPage() {
  return (
    <div className="container-padding section-spacing">
      <h1 className="mb-8">Panel de Administración</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Recintos</CardTitle>
            <CardDescription>Administra los recintos disponibles para eventos y actividades.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/recintos">Gestionar Recintos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Cursos</CardTitle>
            <CardDescription>Administra los cursos disponibles y su programación.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/cursos">Gestionar Cursos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Administra los usuarios y sus permisos del sistema.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/usuarios">Gestionar Usuarios</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Reservas</CardTitle>
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