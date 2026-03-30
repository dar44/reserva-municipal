import ProfilePage from '@/components/ProfilePage'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { buildStorageUrl } from '@/lib/storage'

export const metadata = {
  title: 'Mi perfil · ServiMunicipal',
  description: 'Consulta y actualiza los datos de tu perfil'
}

export default async function PerfilPage() {
  const supabase = await createSupabaseServer()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  const userUid = user?.id

  let initialProfile = {
    name: '',
    surname: '',
    dni: '',
    phone: '',
    image: null as string | null,
    image_bucket: null as string | null
  }
  let initialImageUrl: string | null = null

  if (userUid) {
    const { data } = await supabase
      .from('users')
      .select('name,surname,dni,phone,image,image_bucket')
      .eq('uid', userUid)
      .single()

    if (data) {
      initialProfile = {
        name: data.name ?? '',
        surname: data.surname ?? '',
        dni: data.dni ?? '',
        phone: data.phone ?? '',
        image: data.image ?? null,
        image_bucket: data.image_bucket ?? null
      }
      initialImageUrl = await buildStorageUrl(supabase, initialProfile.image_bucket, initialProfile.image)
    }
  }

  return (
    <ProfilePage
      initialProfile={initialProfile}
      initialImageUrl={initialImageUrl}
    />
  )
}
