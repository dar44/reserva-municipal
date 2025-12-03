import DeleteButton from './DeleteButton'
import { Fragment } from "react";
import OpenStreetMapView from "@/components/OpenStreetMapView";
import Link from "next/link";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { createSupabaseServerReadOnly } from "@/lib/supabaseServer";
import StatCard from "@/components/StatCard";

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis reservas</h1>
      <p className="text-gray-400 mb-6">Gestiona tus reservas de recintos e inscripciones a cursos</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total de reservas" value={totalReservas} />
        <StatCard label="Reservas activas" value={reservasActivas} />
        <StatCard label="Total invertido" value={formatCurrency(totalInvertido, currency)} />
      </div>

      {/* Active Reservations */}
      <h2 className="text-xl font-semibold mb-4">Reservas activas</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-8 border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700 text-gray-200 text-sm uppercase">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Fecha inicio</th>
                <th className="px-4 py-3">Fecha fin</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {activeItems.length > 0 ? (
                activeItems.map(item => (
                  <Fragment key={`${item.type}-${item.id}`}>
                    <tr className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-gray-300">{new Date(item.startAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-300">{new Date(item.endAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">
                        {item.price > 0 ? formatCurrency(item.price, currency) : 'Gratis'}
                      </td>
                      <td className="px-4 py-3">
                        {item.paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 border border-yellow-700">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                    </tr>
                    {expandedId === item.id && item.type === 'Recinto' && item.ubication && (
                      <tr className="bg-gray-900/50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-300">
                                <span className="mr-2">📍</span>
                                Cómo llegar a tu reserva
                              </p>
                              <Link
                                href="/reservas"
                                scroll={false}
                                className="text-xs text-gray-500 hover:text-gray-300"
                              >
                                Cerrar mapa
                              </Link>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">Ubicación de {item.name}: {item.ubication}</p>
                            <OpenStreetMapView
                              address={item.ubication}
                              title={`Ubicación de ${item.name}`}
                              className="h-64"
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No tienes reservas activas en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Section */}
      <h2 className="text-xl font-semibold mb-4">Historial</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700 text-gray-200 text-sm uppercase">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {historyItems.length > 0 ? (
                historyItems.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-400">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(item.startAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-500">
                      {item.price > 0 ? formatCurrency(item.price, currency) : 'Gratis'}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'cancelada' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300 border border-red-700">
                          Cancelada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                          Finalizada
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No tienes historial de reservas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}