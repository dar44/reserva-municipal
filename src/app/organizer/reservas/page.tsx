import OrganizerReservationsClient from './OrganizerReservationsClient'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function OrganizerReservationsPage () {
  const supabase = await createSupabaseServer()
  const profile = await getSessionProfile(supabase)

  const [coursesResponse, recintosResponse, reservationsResponse] = await Promise.all([
    supabase
      .from('cursos')
      .select('id,name')
      .eq('organizer_uid', profile.uid)
      .order('name'),
    supabase
      .from('recintos')
      .select('id,name,state')
      .order('name'),
    supabase
      .from('curso_reservas')
      .select('id,curso_id,recinto_id,start_at,end_at,status,observations')
      .eq('organizer_uid', profile.uid)
      .order('created_at', { ascending: false }),
  ])

  const courses = coursesResponse.data ?? []
  const recintos = recintosResponse.data ?? []
  const reservations = reservationsResponse.data ?? []

  if (coursesResponse.error) {
    console.error('Error fetching organizer courses for reservations', coursesResponse.error)
  }

  if (recintosResponse.error) {
    console.error('Error fetching organizer recintos for reservations', recintosResponse.error)
  }

  if (reservationsResponse.error) {
    console.error('Error fetching organizer reservations', reservationsResponse.error)
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-2 sm:p-4">
      <OrganizerReservationsClient
        courses={courses}
        recintos={recintos}
        reservations={reservations}
      />
    </section>
  )
}