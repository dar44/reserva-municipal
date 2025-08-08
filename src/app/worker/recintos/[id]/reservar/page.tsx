import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";

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
        <form className="space-y-3">
          <label className="block text-sm">Fecha
            <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" />
          </label>
          <label className="block text-sm">Hora
            <input type="time" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" />
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1 bg-blue-600 rounded text-xs">Usuario existente</button>
              <button type="button" className="px-3 py-1 bg-gray-600 rounded text-xs">Nuevo usuario</button>
            </div>
            <input type="email" placeholder="Correo electrónico" className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
          </div>
          <button className="w-full bg-green-600 py-2 rounded">Confirmar Reserva</button>
        </form>
      </div>
    </div>
  );
}