import { createSupabaseServer } from "@/lib/supabaseServer";
import DeleteButton from "./DeleteButton";
import { getConfiguredCurrency } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

  return (
    <section className="container-padding section-spacing">
      <header className="mb-8">
        <h1>Listado de Reservas de Ciudadanos</h1>
        <p className="text-secondary mt-2">
          Administra las reservas realizadas por los ciudadanos y controla su estado de pago.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Recinto</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(reservas ?? []).map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">#{r.id}</TableCell>
                <TableCell className="text-secondary">{r.users?.email ?? '—'}</TableCell>
                <TableCell className="text-secondary">{r.recintos?.name ?? '—'}</TableCell>
                <TableCell className="text-secondary text-xs">
                  <div>{formatDate(r.start_at)}</div>
                  <div>{formatDate(r.end_at)}</div>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(Number(r.price ?? 0))}</TableCell>
                <TableCell>
                  <Badge className={r.paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                    {r.paid ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DeleteButton id={r.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!reservas || reservas.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-secondary py-8">
                  No hay reservas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}