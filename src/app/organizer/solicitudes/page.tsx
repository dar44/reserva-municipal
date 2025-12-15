import OrganizerReservationsClient from './OrganizerReservationsClient'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { getSessionProfile } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function OrganizerReservationsPage() {
    const supabase = await createSupabaseServer()
    const profile = await getSessionProfile(supabase)

    const [coursesResponse, recintosResponse, reservationsResponse] = await Promise.all([
        supabase
            .from('cursos')
            .select('id,name,begining_date,end_date,start_time,end_time,days_of_week')
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
        <section className="container-padding section-spacing max-w-5xl mx-auto">
            {/* Header con gradient - Estética-Usabilidad */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-lg -mx-4 -my-2" />
                <div className="relative">
                    <h1 className="mb-2">Solicitudes de Recintos</h1>
                    <p className="text-foreground-secondary">
                        Gestiona las solicitudes de uso de recintos para tus cursos y consulta su estado de aprobación
                    </p>
                </div>
            </div>

            <OrganizerReservationsClient
                courses={courses}
                recintos={recintos}
                reservations={reservations}
            />
        </section>
    )
}
