import { createSupabaseServer } from "@/lib/supabaseServer";
import DeleteButton from "./DeleteButton";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyWorkerReservasState } from "@/components/ui/empty-state"
import { Calendar, DollarSign, History } from "lucide-react"

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

function ReservasTable({ reservas, formatDate, formatPrice, showDelete = true }: {
  reservas: Reserva[];
  formatDate: (d: string) => string;
  formatPrice: (n: number) => string;
  showDelete?: boolean;
}) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Recinto</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Fecha y Hora</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Precio</span>
              </div>
            </TableHead>
            <TableHead>Pago</TableHead>
            {showDelete && <TableHead className="text-center">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservas.map(r => (
            <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">#{r.id}</TableCell>
              <TableCell className="text-secondary">{r.users?.email ?? '—'}</TableCell>
              <TableCell className="text-secondary">{r.recintos?.name ?? '—'}</TableCell>
              <TableCell className="text-secondary text-sm">
                <div>{formatDate(r.start_at)}</div>
                <div>{formatDate(r.end_at)}</div>
              </TableCell>
              <TableCell className="font-medium">{formatPrice(Number(r.price ?? 0))}</TableCell>
              <TableCell>
                <Badge className={r.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {r.paid ? 'Pagado' : 'Pendiente'}
                </Badge>
              </TableCell>
              {showDelete && (
                <TableCell className="text-center">
                  <DeleteButton id={r.id} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function WorkerReservasPage() {
  const supabase = await createSupabaseServer();
  const { data: reservas, error } = await supabase
    .from("reservas")
    .select("id,start_at,end_at,price,paid,users(email),recintos(name)")
    .order("start_at", { ascending: true })
    .returns<Reserva[]>();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  const currency = getConfiguredCurrency();
  const formatPrice = (amount: number) => formatCurrency(amount, currency);

  if (error) {
    console.error("Error fetching citizen reservations", error);
  }

  const now = new Date();
  const active = (reservas ?? []).filter(r => new Date(r.end_at) >= now);
  const past = (reservas ?? []).filter(r => new Date(r.end_at) < now);

  return (
    <section className="container-padding section-spacing">
      {/* Header with gradient - Estética-Usabilidad Effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-4" />
        <div className="relative">
          <h1 className="mb-2">Listado de Reservas de Ciudadanos</h1>
          <p className="text-secondary mt-2">
            Administra las reservas realizadas por los ciudadanos y controla su estado de pago.
          </p>
        </div>
      </div>

      {/* Reservas activas */}
      {active.length > 0 ? (
        <ReservasTable reservas={active} formatDate={formatDate} formatPrice={formatPrice} />
      ) : (
        reservas && reservas.length === 0 ? (
          <EmptyWorkerReservasState />
        ) : (
          <p className="text-secondary text-sm mb-6">No hay reservas activas en este momento.</p>
        )
      )}

      {/* Historial */}
      {past.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-semibold">Historial de Reservas</h2>
          </div>
          <p className="text-secondary text-sm mb-4">Reservas cuya fecha de fin ya ha pasado.</p>
          <div className="opacity-75">
            <ReservasTable reservas={past} formatDate={formatDate} formatPrice={formatPrice} showDelete={false} />
          </div>
        </div>
      )}
    </section>
  );
}
