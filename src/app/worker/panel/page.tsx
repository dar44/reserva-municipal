//app/worker/panel/page.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WorkerPanelPage() {
  return (
    <div className="container-padding section-spacing">
      <h1 className="mb-8">Panel del Trabajador Municipal</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Recintos Deportivos</CardTitle>
            <CardDescription>Consulta los recintos y realiza reservas para los ciudadanos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/recintos">Ver Recintos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Cursos Disponibles</CardTitle>
            <CardDescription>Consulta los cursos y realiza inscripciones para los ciudadanos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/cursos">Ver Cursos</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Solicitudes</CardTitle>
            <CardDescription>Gestiona las solicitudes de recintos enviadas por los organizadores de cursos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/solicitudes">Ver Solicitudes</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle>Reservas</CardTitle>
            <CardDescription>Consulta las reservas ciudadanas y valida las solicitudes de recintos para cursos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/reservas">Ver Reservas</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}