import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'
import { getRecintoDefaultPublicUrl, getRecintoImageUrl } from '@/lib/recintoImages'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function RecintoDetailPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  const supabase = await createSupabaseServer()
  const { data: recinto } = await supabase
    .from('recintos')
    .select('id,name,description,ubication,province,postal_code,state,image,image_bucket')
    .eq('id', id)
    .single()

  if (!recinto) redirect('/admin/recintos')

  const defaultImageUrl = getRecintoDefaultPublicUrl(supabase)
  const imageUrl = getRecintoImageUrl(supabase, recinto.image, recinto.image_bucket, defaultImageUrl)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link href="/admin/recintos" className="text-blue-400 text-sm">&larr; Volver</Link>
        <h1 className="text-2xl font-bold">Detalle del Recinto</h1>
      </div>

      <div className="bg-gray-800 p-4 rounded space-y-2 text-sm">
        <div className="flex justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={recinto.name} width={240} height={160} className="h-40 w-full max-w-md rounded object-cover" />
          ) : (
            <div className="h-40 w-full max-w-md rounded bg-gray-700" />
          )}
        </div>
        <p><strong>Nombre:</strong> {recinto.name}</p>
        <p><strong>Descripción:</strong> {recinto.description}</p>
        <p><strong>Ubicación:</strong> {recinto.ubication}</p>
        <p><strong>Provincia:</strong> {recinto.province}</p>
        <p><strong>Código Postal:</strong> {recinto.postal_code}</p>
        <p><strong>Estado:</strong> {recinto.state}</p>
      </div>

      <div className="space-x-2">
        <Link href={`/admin/recintos/${id}/editar`} className="text-yellow-400">Editar</Link>
        <DeleteButton id={id} />
      </div>
    </div>
  )
}