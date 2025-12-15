import DeleteButton from './DeleteButton'
import { Fragment } from "react";
import OpenStreetMapView from "@/components/OpenStreetMapView";
import Link from "next/link";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { createSupabaseServerReadOnly } from "@/lib/supabaseServer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyReservasState } from "@/components/ui/empty-state"

export const dynamic = "force-dynamic";

interface Reserva {
  id: number
  start_at: string
  end_at: string
  price: number
  status: string
  paid: boolean
  recintos: { name: string; ubication?: string } | null
}

interface Inscripcion {
  id: number
  status: string
  paid: boolean
  cursos: {
    name: string
    begining_date: string
    end_date: string
    price: number
  } | null
}

type UnifiedItem = {
  id: number
  originalId: number
  type: 'Recinto' | 'Curso'
  name: string
  startAt: string
  endAt: string
  price: number
  status: string
  paid: boolean
  ubication?: string
}

export default async function ReservasPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerReadOnly();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p className="mt-20 text-center">🔒 Inicia sesión primero</p>;
  }

  const userUid = user.id
  const params = await searchParams;
  const expandedId = params?.expanded ? Number(params.expanded) : null;

  // Fetch Reservas
  const { data: reservasData } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,price,status,paid,recintos(name,ubication)")
    .eq("user_uid", userUid)
    .returns<Reserva[]>();

  // Fetch Inscripciones
  const { data: inscripcionesData } = await supabase
    .from("inscripciones")
    .select("id,status,paid,cursos(name,begining_date,end_date,price)")
    .eq("user_uid", userUid)
    .returns<Inscripcion[]>();

  const currency = getConfiguredCurrency()

  // Unify data
  const unifiedItems: UnifiedItem[] = []

  if (reservasData) {
    reservasData.forEach(r => {
      unifiedItems.push({
        id: r.id, // We might need a unique ID for the key if IDs clash, but they are from different tables. Let's use a composite key or just rely on type+id
        originalId: r.id,
        type: 'Recinto',
        name: r.recintos?.name || 'Recinto desconocido',
        startAt: r.start_at,
        endAt: r.end_at,
        price: Number(r.price),
        status: r.status,
        paid: r.paid,
        ubication: r.recintos?.ubication
      })
    })
  }

  if (inscripcionesData) {
    inscripcionesData.forEach(i => {
      unifiedItems.push({
        id: i.id,
        originalId: i.id,
        type: 'Curso',
        name: i.cursos?.name || 'Curso desconocido',
        startAt: i.cursos?.begining_date || '', // These are dates YYYY-MM-DD
        endAt: i.cursos?.end_date || '',
        price: Number(i.cursos?.price || 0),
        status: i.status,
        paid: i.paid
      })
    })
  }

  // Sort by start date descending
  unifiedItems.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())

  // Calculate stats
  const totalReservas = unifiedItems.filter(i => i.status === 'activa').length;

  const now = new Date();
  const reservasActivas = unifiedItems.filter(i =>
    i.status === 'activa' &&
    i.paid &&
    new Date(i.endAt) >= now
  ).length;

  const totalInvertido = unifiedItems
    .filter(i => i.paid)
    .reduce((acc, curr) => acc + curr.price, 0);

  // Split into Active and History
  const activeItems = unifiedItems.filter(i =>
    i.status === 'activa' && new Date(i.endAt) >= now
  );

  const historyItems = unifiedItems.filter(i =>
    i.status === 'cancelada' || (i.status === 'activa' && new Date(i.endAt) < now)
  );

  return (
    <div className="container-padding section-spacing">
      {/* Header with gradient */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-4" />
        <div className="relative">
          <h1 className="mb-4">Mis reservas</h1>
          <p className="text-secondary mb-4">Gestiona tus reservas de recintos e inscripciones a cursos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md bg-gradient-to-br from-background to-surface">
          <CardHeader className="pb-2">
            <CardDescription>Total de reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalReservas}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-gradient-to-br from-background to-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-secondary">Reservas activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reservasActivas}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-gradient-to-br from-background to-surface">
          <CardHeader className="pb-2">
            <CardDescription>Total invertido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalInvertido, currency)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Reservations */}
      <h2 className="text-xl font-semibold mb-4">Reservas activas</h2>
      {activeItems.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha inicio</TableHead>
                <TableHead>Fecha fin</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeItems.map(item => (
                <Fragment key={`${item.type}-${item.id}`}>
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-secondary text-xs">{new Date(item.startAt).toLocaleString()}</TableCell>
                    <TableCell className="text-secondary text-xs">{new Date(item.endAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      {item.price > 0 ? formatCurrency(item.price, currency) : 'Gratis'}
                    </TableCell>
                    <TableCell>
                      <Badge className={item.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {item.paid ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-3">
                        {item.type === 'Recinto' && (
                          <Link
                            href={`/reservas?expanded=${item.id}`}
                            scroll={false}
                            className="text-sm font-medium text-gray-300 hover:text-white hover:underline"
                          >
                            Ver detalle
                          </Link>
                        )}
                        {!item.paid && (
                          <DeleteButton id={item.originalId} type={item.type} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === item.id && item.type === 'Recinto' && item.ubication && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={7} className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-foreground">
                              <span className="mr-2">📍</span>
                              Cómo llegar a tu reserva
                            </p>
                            <Link
                              href="/reservas"
                              scroll={false}
                              className="text-xs text-tertiary hover:text-foreground"
                            >
                              Cerrar mapa
                            </Link>
                          </div>
                          <p className="text-xs text-tertiary mb-2">Ubicación de {item.name}: {item.ubication}</p>
                          <OpenStreetMapView
                            address={item.ubication}
                            title={`Ubicación de ${item.name}`}
                            className="h-64"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="mb-8">
          <EmptyReservasState />
        </div>
      )}

      {/* History Section */}
      <h2 className="text-xl font-semibold mb-4">Historial</h2>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.length > 0 ? (
              historyItems.map(item => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>
                    <Badge variant="outline">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-tertiary">{item.name}</TableCell>
                  <TableCell className="text-secondary text-xs">{new Date(item.startAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-secondary">
                    {item.price > 0 ? formatCurrency(item.price, currency) : 'Gratis'}
                  </TableCell>
                  <TableCell>
                    <Badge className={item.status === 'cancelada' ? "bg-error text-error-foreground" : "bg-muted text-muted-foreground"}>
                      {item.status === 'cancelada' ? 'Cancelada' : 'Finalizada'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-secondary py-8">
                  No tienes historial de reservas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}