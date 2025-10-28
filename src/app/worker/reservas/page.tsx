import { createSupabaseServer } from "@/lib/supabaseServer";
import DeleteButton from "./DeleteButton";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import CourseReservationsTable from "./CourseReservationsTable";

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

interface CourseReservationRecord {
  id: number;
  curso_id: number;
  recinto_id: number;
  start_at: string;
  end_at: string;
  status: "pendiente" | "aprobada" | "rechazada" | "cancelada";
  observations: string | null;
  reviewed_at: string | null;
  worker_uid: string | null;
}

type CourseReservationRow = CourseReservationRecord & {
  curso_name: string;
  recinto_name: string;
};

export default async function WorkerReservasPage() {
  const supabase = await createSupabaseServer();
  const [{ data: reservas }, { data: courseReservations, error: courseReservationsError }] = await Promise.all([
    supabase
      .from("reservas")
      .select("id,start_at,end_at,price,paid,users(email),recintos(name)")
      .order("start_at", { ascending: true })
      .returns<Reserva[]>(),
    supabase
      .from("curso_reservas")
      .select("id,curso_id,recinto_id,start_at,end_at,status,observations,reviewed_at,worker_uid")
      .order("created_at", { ascending: false })
      .returns<CourseReservationRecord[]>(),
  ]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  const currency = getConfiguredCurrency();
  const formatPrice = (amount: number) => formatCurrency(amount, currency);

  const courseIds = Array.from(new Set((courseReservations ?? []).map(r => r.curso_id)));
  const recintoIds = Array.from(new Set((courseReservations ?? []).map(r => r.recinto_id)));

  type NameRecord = { id: number; name: string };

  let courseNameMap = new Map<number, string>();
  let recintoNameMap = new Map<number, string>();

  if (courseIds.length > 0) {
    const courseNamesResult = await supabase
      .from("cursos")
      .select("id,name")
      .in("id", courseIds)
      .returns<NameRecord[]>();

    courseNameMap = new Map((courseNamesResult.data ?? []).map(record => [record.id, record.name]));
    if (courseNamesResult.error) {
      console.error("Error fetching course names", courseNamesResult.error);
    }
  }

  if (recintoIds.length > 0) {
    const recintoNamesResult = await supabase
      .from("recintos")
      .select("id,name")
      .in("id", recintoIds)
      .returns<NameRecord[]>();

    recintoNameMap = new Map((recintoNamesResult.data ?? []).map(record => [record.id, record.name]));
    if (recintoNamesResult.error) {
      console.error("Error fetching recinto names", recintoNamesResult.error);
    }
  }

  if (courseReservationsError) {
    console.error("Error fetching course reservations", courseReservationsError);
  }

  const courseReservationRows: CourseReservationRow[] = (courseReservations ?? []).map(reservation => ({
    ...reservation,
    curso_name: courseNameMap.get(reservation.curso_id) ?? `Curso #${reservation.curso_id}`,
    recinto_name: recintoNameMap.get(reservation.recinto_id) ?? `Recinto #${reservation.recinto_id}`,
  }));

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">Listado de Reservas de Ciudadanos</h1>
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
                <td className="px-4 py-2">{formatPrice(Number(r.price ?? 0))}</td>
                <td className="px-4 py-2">{r.paid ? 'Pagado' : 'Pendiente'}</td>
                <td className="px-4 py-2">
                  <DeleteButton id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold">Solicitudes de recintos para cursos</h2>
          <p className="text-sm text-gray-300">Valida o rechaza las peticiones enviadas por los organizadores.</p>
        </header>
        <CourseReservationsTable reservations={courseReservationRows} />
      </section>
    </div>
  );
}