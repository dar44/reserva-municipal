import OrganizerRecintosClient from './OrganizerRecintosClient'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function OrganizerRecintosPage() {
  const supabase = await createSupabaseServer()
  const { data: recintos, error } = await supabase
    .from('recintos')
    .select('id,name,ubication,state')
    .order('name')

  if (error) {
    console.error('Error fetching recintos for organizer', error)
  }

  return (
    <section className="container-padding section-spacing max-w-5xl mx-auto">
      {/* Header con gradient - Refactoring UI: jerarquía clara */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Recintos Disponibles</h1>
          <p className="text-foreground-secondary">
            Consulta los recintos municipales disponibles para solicitar reservas para tus cursos
          </p>
        </div>
      </div>

      <OrganizerRecintosClient recintos={recintos ?? []} />
    </section>
  )
}