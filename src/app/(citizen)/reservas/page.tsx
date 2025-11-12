import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DeleteButton from './DeleteButton'
import { Fragment } from "react";
import OpenStreetMapView from "@/components/OpenStreetMapView";
import Link from "next/link";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";

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

export default async function ReservasPage () {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        }
      }
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  //ESTO YA NO HACE FALTA PORQUE LA PÁGINA ESTÁ PROTEGIDA
  if (!user) {
    return <p className="mt-20 text-center">🔒 Inicia sesión primero</p>;
  }

  const userUid = user.id

  const { data: reservas } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,price,status,paid,recintos(name,ubication)")
    .eq("user_uid", userUid)
    .order("start_at", { ascending: false })
    .returns<Reserva[]>();

    const currency = getConfiguredCurrency()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tus reservas</h1>
      <table className="min-w-full text-left bg-gray-800 rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2">Recinto</th>
            <th className="px-4 py-2">Fecha de inicio</th>
            <th className="px-4 py-2">Fecha de fin</th>
            <th className="px-4 py-2">Precio</th>
            <th className="px-4 py-2">Estado pago</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
             <Fragment key={r.id}>
              <tr className="border-t border-gray-700">
                <td className="px-4 py-2">{r.recintos?.name}</td>
                <td className="px-4 py-2">{new Date(r.start_at).toLocaleString()}</td>
                <td className="px-4 py-2">{new Date(r.end_at).toLocaleString()}</td>
                <td className="px-4 py-2">{Number(r.price) > 0 ? formatCurrency(Number(r.price), currency) : 'Gratis'}</td>
                <td className="px-4 py-2">
                  {r.paid ? (
                    <span className="text-sm text-green-500">Pagado</span>
                  ) : (
                    <span className="text-sm text-yellow-400">Pendiente</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/reservas/${r.id}`}
                      className="text-blue-400 underline"
                    >
                      Ver detalle
                    </Link>
                    {r.status === "activa" ? (
                      <DeleteButton id={r.id} />
                    ) : (
                      <span className="text-sm text-gray-500">{r.status}</span>
                    )}
                  </div>
                </td>
              </tr>
              {r.status === "activa" && r.paid && r.recintos?.ubication && (
                <tr className="border-t border-gray-800 bg-gray-900/60">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-200">
                        Cómo llegar a tu reserva
                      </p>
                      <OpenStreetMapView
                        address={r.recintos.ubication}
                        title={r.recintos.name ? `Ubicación de ${r.recintos.name}` : 'Ubicación de la reserva'}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}