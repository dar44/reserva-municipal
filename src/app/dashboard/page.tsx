import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default async function CitizenDashboard() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recintos Disponibles</h1>
      {/* Reutilizamos el componente de lista directamente */}
      {/* import ListRecintosClient cuando lo extraigas, por ahora duplicamos inline */}
      {/* Contenido simplificado: redirigimos al listado real */}
      <p>Redirigiendo…</p>
      {redirect('/recintos')}
    </div>
  );
}