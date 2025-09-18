import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DeleteButton from './DeleteButton'

export const dynamic = "force-dynamic";

interface Reserva {
  id: number
  start_at: string
  end_at: string
  price: number
  status: string
  paid: boolean
  recintos: { name: string } | null
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
  if (!user) {
    return <p className="mt-20 text-center">🔒 Inicia sesión primero</p>;
  }

  const userUid = user.id

  const { data: reservas } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,price,status,paid,recintos(name)")
    .eq("user_uid", userUid)
    .order("start_at", { ascending: false })
    .returns<Reserva[]>();

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
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{r.recintos?.name}</td>
              <td className="px-4 py-2">{new Date(r.start_at).toLocaleString()}</td>
              <td className="px-4 py-2">{new Date(r.end_at).toLocaleString()}</td>
              <td className="px-4 py-2">{r.price}CLP</td>
                <td className="px-4 py-2">
                {r.paid ? (
                  <span className="text-sm text-green-500">Pagado</span>
                ) : (
                  <span className="text-sm text-yellow-400">Pendiente</span>
                )}
              </td>
              <td className="px-4 py-2">
                {r.status === "activa" ? (
                  <DeleteButton id={r.id} />
                ) : (
                  <span className="text-sm text-gray-500">{r.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}