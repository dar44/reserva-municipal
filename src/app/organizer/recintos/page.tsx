import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function OrganizerRecintosPage () {
  const supabase = await createSupabaseServer()
  const { data: recintos, error } = await supabase
    .from('recintos')
    .select('id,name,ubication,state')
    .order('name')

  if (error) {
    console.error('Error fetching recintos for organizer', error)
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-2 sm:p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Recintos disponibles</h1>
        <p className="text-sm text-gray-400">
          Consulta la lista de espacios municipales y su estado actual antes de realizar una solicitud.
        </p>
      </header>

      {recintos?.length ? (
        <ul className="space-y-3">
          {recintos.map(recinto => (
            <li key={recinto.id} className="rounded border border-gray-700 bg-gray-900 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{recinto.name}</h2>
                  <p className="text-sm text-gray-400">{recinto.ubication ?? 'Ubicación no especificada'}</p>
                </div>
                <span className={`self-start rounded px-2 py-0.5 text-xs uppercase ${
                  recinto.state === 'Disponible'
                    ? 'bg-green-700 text-white'
                    : recinto.state === 'No disponible'
                      ? 'bg-yellow-700 text-white'
                      : 'bg-gray-700 text-white'
                }`}>
                  {recinto.state}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No hay recintos disponibles por el momento.</p>
      )}
    </section>
  )
}