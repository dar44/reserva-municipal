import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'
import DeleteButton from './DeleteButton'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function RecintoDetailPage({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/admin/recintos')

  const supabase = await createSupabaseServer()
  const { data: recinto } = await supabase
    .from('recintos')
    .select('id,name,description,ubication,province,postal_code,state')
    .eq('id', id)
    .single()

  if (!recinto) redirect('/admin/recintos')

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link href="/admin/recintos" className="text-blue-400 text-sm">&larr; Volver</Link>
        <h1 className="text-2xl font-bold">Detalle del Recinto</h1>
      </div>

      <div className="bg-gray-800 p-4 rounded space-y-2 text-sm">
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