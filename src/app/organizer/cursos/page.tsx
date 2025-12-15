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
      {/* Header con gradient - Ley de Jakob: consistencia */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
        <div className="relative">
          <h1 className="mb-2">Gestión de Cursos</h1>
          <p className="text-foreground-secondary">
            Crea, edita y elimina tus cursos. Gestiona la información y el estado de cada programa
          </p>
        </div>
      </div>

      <OrganizerCoursesClient courses={cursos ?? []} defaultImages={defaultImages} />
    </section>
  )
}