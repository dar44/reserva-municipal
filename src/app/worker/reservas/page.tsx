import { createSupabaseServer } from "@/lib/supabaseServer";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

interface Reserva {
  id: number;
  start_at: string;
  end_at: string;
  price: number;
  paid: boolean;
  users: { email: string } | null;
  recintos: { name: string } | null;
}

export default async function WorkerReservasPage() {
  const supabase = await createSupabaseServer();
  const { data: reservas } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,price,paid,users(email),recintos(name)")
    .order("start_at", { ascending: true })
    .returns<Reserva[]>(); //uso interfaz reserva para que VSCode no me de como error

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listado de Reservas</h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Usuario</th>
            <th className="px-4 py-2 text-left">Recinto</th>
            <th className="px-4 py-2 text-left">Fecha y Hora</th>
            <th className="px-4 py-2 text-left">Precio</th>
            <th className="px-4 py-2 text-left">Pago</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
            <tr key={r.id} className="border-t border-gray-700">
              <td className="px-4 py-2">{r.id}</td>
              <td className="px-4 py-2">{r.users?.email ?? ''}</td>
              <td className="px-4 py-2">{r.recintos?.name ?? ''}</td>
              <td className="px-4 py-2">{formatDate(r.start_at)} - {formatDate(r.end_at)}</td>
              <td className="px-4 py-2">{r.price}€</td>
              <td className="px-4 py-2">{r.paid ? 'Pagado' : 'Pendiente'}</td>
              <td className="px-4 py-2">
                <DeleteButton id={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}