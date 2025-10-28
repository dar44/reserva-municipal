import OrganizerPanelClient from './OrganizerPanelClient'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

type OrganizerCourse = {
  id: number
  name: string
  description: string | null
  location: string | null
  begining_date: string | null
  end_date: string | null
  price: number | null
  capacity: number | null
  state: string
}

type OrganizerRecinto = {
  id: number
  name: string
  ubication: string | null
  state: string
}

type OrganizerReservation = {
  id: number
  curso_id: number
  recinto_id: number
  start_at: string
  end_at: string
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'
  observations: string | null
  reviewed_at: string | null
  worker_uid: string | null
}

export default async function OrganizerPanelPage () {
  const supabase = await createSupabaseServer()
  const profile = await getSessionProfile(supabase)

  const [{ data: cursos, error: cursosError }, { data: recintos, error: recintosError }, { data: reservas, error: reservasError }] = await Promise.all([
    supabase
      .from('cursos')
      .select('id,name,description,location,begining_date,end_date,price,capacity,state')
      .eq('organizer_uid', profile.uid)
      .order('created_at', { ascending: false })
      .returns<OrganizerCourse[]>(),
    supabase
      .from('recintos')
      .select('id,name,ubication,state')
      .order('name')
      .returns<OrganizerRecinto[]>(),
    supabase
      .from('curso_reservas')
      .select('id,curso_id,recinto_id,start_at,end_at,status,observations,reviewed_at,worker_uid')
      .eq('organizer_uid', profile.uid)
      .order('created_at', { ascending: false })
      .returns<OrganizerReservation[]>(),
  ])

  if (cursosError) {
    console.error('Error fetching organizer courses', cursosError)
  }

  if (recintosError) {
    console.error('Error fetching organizer recintos', recintosError)
  }

  if (reservasError) {
    console.error('Error fetching organizer reservations', reservasError)
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <OrganizerPanelClient
        courses={cursos ?? []}
        recintos={recintos ?? []}
        reservations={reservas ?? []}
      />
    </section>
  )
}