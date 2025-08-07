import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RecintoDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({
    cookies
  });
  const { data: recinto } = await supabase.from("recintos").select("*").eq("id", params.id).single();
  if (!recinto) return notFound();

  return (
    <div className="space-y-6">
      <button onClick={() => history.back()} className="text-sm underline">← Volver al listado</button>
      <div className="grid md:grid-cols-2 gap-8 bg-gray-800 rounded-lg p-6 shadow">
        <div className="h-64 bg-gray-700 flex items-center justify-center text-gray-400">
          {recinto.image ? <img src={recinto.image} alt={recinto.name} className="object-cover w-full h-full" /> : "Imagen"}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{recinto.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs ${recinto.state==='Disponible'?'bg-green-700':'bg-red-700'}`}>{recinto.state}</span>
          </div>
          <p><strong>Ubicación:</strong> {recinto.ubication}</p>
          <p><strong>Descripción:</strong> {recinto.description}</p>

          {/* Reservar horario */}
          {recinto.state==='Disponible' && (
            <form action={`/api/reservas`} method="post" className="space-y-3">
              <input type="hidden" name="recinto_id" value={recinto.id} />
              <label className="block text-sm">Fecha de reserva
                <input type="date" name="date" className="block w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" required />
              </label>
              <label className="block text-sm">Hora inicio – fin
                <select name="slot" className="block w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1">
                  <option value="14:00-15:00">14:00‑15:00</option>
                  <option value="15:00-16:00">15:00‑16:00</option>
                </select>
              </label>
              <button className="w-full bg-blue-600 py-2 rounded">Confirmar reserva – 1 €</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}