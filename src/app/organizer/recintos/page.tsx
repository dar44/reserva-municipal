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

  return <OrganizerRecintosClient recintos={recintos ?? []} />
}