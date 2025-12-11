import OrganizerCoursesClient from './OrganizerCoursesClient'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'
import { COURSE_DEFAULTS_FOLDER, COURSE_IMAGE_BUCKET } from '@/lib/cursoImages'
import { listBucketPrefix } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function OrganizerCoursesPage() {
  const supabase = await createSupabaseServer()
  const profile = await getSessionProfile(supabase)

  const { data: cursos, error } = await supabase
    .from('cursos')
    .select('id,name,description,location,begining_date,end_date,start_time,end_time,days_of_week,price,capacity,state,image,image_bucket')
    .eq('organizer_uid', profile.uid)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizer courses', error)
  }

  const defaultImages = await listBucketPrefix(
    supabase,
    COURSE_IMAGE_BUCKET,
    COURSE_DEFAULTS_FOLDER,
  )

  return (
    <section className="container-padding section-spacing max-w-5xl mx-auto">
      <OrganizerCoursesClient courses={cursos ?? []} defaultImages={defaultImages} />
    </section>
  )
}