import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabaseServer'
import CursoActions from './CursoActions'
import { getPublicStorageUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminCursosPage () {
  const supabase = await createSupabaseServer()
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select('id,image,image_bucket,name,description,begining_date,state')
    .order('name')

  if (error) {
    console.error('LIST cursos error:', error)
  }

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Link href="/admin/cursos/nuevo" className="bg-blue-600 px-3 py-1 rounded text-sm">+ Nuevo Curso</Link>
      </div>

      {!cursosWithImages?.length && <p className="text-sm opacity-80">No hay cursos.</p>}

      {!!cursosWithImages?.length && (
        <table className="min-w-full bg-gray-800 rounded overflow-hidden text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Imagen</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Fecha Inicio</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursosWithImages.map(c => (
              <tr key={c.id} className="border-t border-gray-700">
                <td className="px-4 py-2">
                  {c.imageUrl ? (
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-400">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.description}</td>
                <td className="px-4 py-2">{c.begining_date ? new Date(c.begining_date).toLocaleDateString() : ''}</td>
                <td className="px-4 py-2">{c.state}</td>
                  <td className="px-4 py-2">
                    <CursoActions id={c.id} />
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}