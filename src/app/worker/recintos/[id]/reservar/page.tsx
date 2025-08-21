import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import ReservationForm from "./ReservationForm";

export const dynamic = "force-dynamic";

export default async function ReservarRecinto({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServer();
  const { data: recinto } = await supabase
    .from("recintos")
    .select("id,name,ubication,state")
    .eq("id", params.id)
    .single();

  if (!recinto) return notFound();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Link href="/worker/recintos" className="text-sm underline">← Volver al listado</Link>
      <h1 className="text-2xl font-bold">Reserva de {recinto.name}</h1>
      <div className="bg-gray-800 p-4 rounded space-y-3">
        <span className={`inline-block px-2 py-0.5 rounded text-xs ${recinto.state === 'Disponible' ? 'bg-green-700' : 'bg-gray-600'}`}>{recinto.state}</span>
        <p className="text-sm">{recinto.ubication}</p>
        <p className="text-sm">1€/hora</p>
        <ReservationForm recintoId={recinto.id} />
      </div>
    </div>
  );
}