import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const supabase = createServerComponentClient({
    cookies
  });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return <p className="mt-20 text-center">🔒 Inicia sesión primero</p>;
  }
  const { data: reservas } = await supabase
    .from('reservas')
    .select('id,start_at,end_at,status,recintos(name)')
    .eq('user_id', session.user.app_metadata.user_id)
    .order('start_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tus reservas</h1>
      <div className="space-y-4">
        {reservas?.map(r => (
          <div key={r.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.recintos?.[0]?.name}</p>
              <p className="text-sm text-gray-400">{new Date(r.start_at).toLocaleString()} – {new Date(r.end_at).toLocaleTimeString()}</p>
            </div>
            {r.status==='activa' ? (
              <form action={`/api/reservas/${r.id}/cancel`} method="post">
                <button className="bg-red-600 px-3 py-1 rounded text-sm">Cancelar</button>
              </form>
            ) : <span className="text-sm text-gray-500">{r.status}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}