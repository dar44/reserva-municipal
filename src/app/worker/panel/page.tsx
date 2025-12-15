//app/worker/panel/page.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, FileText, CalendarCheck } from "lucide-react";

export default function WorkerPanelPage() {
  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Panel del Trabajador Municipal</h1>
          <p className="text-foreground-secondary">
            Gestiona recintos, cursos, solicitudes y reservas de ciudadanos
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Recintos - Ley de Jakob: mantener iconografía familiar */}
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Recintos Deportivos</CardTitle>
            <CardDescription>Consulta los recintos y realiza reservas para los ciudadanos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/recintos">Ver Recintos</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card Cursos - Jerarquía visual con ícono */}
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Cursos Disponibles</CardTitle>
            <CardDescription>Consulta los cursos y realiza inscripciones para los ciudadanos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/cursos">Ver Cursos</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card Solicitudes - Umbral de Doherty: feedback visual inmediato */}
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Solicitudes</CardTitle>
            <CardDescription>Gestiona las solicitudes de recintos enviadas por los organizadores de cursos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/worker/solicitudes">Ver Solicitudes</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card Reservas - Ley de Fitts: botones grandes y fáciles de clickear */}
        <Card className="flex flex-col shadow-md bg-gradient-to-br from-background to-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border hover:border-primary/20">
          <CardHeader className="flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
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
