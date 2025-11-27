import OrganizerCoursesClient from './OrganizerCoursesClient'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function OrganizerCoursesPage () {
  const supabase = await createSupabaseServer()
  const profile = await getSessionProfile(supabase)

  const { data: cursos, error } = await supabase
    .from('cursos')
    .select('id,name,description,location,begining_date,end_date,price,capacity,state')
    .eq('organizer_uid', profile.uid)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizer courses', error)
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-2 sm:p-4">
      <OrganizerCoursesClient courses={cursos ?? []} />
    </section>
  )
}