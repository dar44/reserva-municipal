import { createSupabaseServer } from "@/lib/supabaseServer";
import Image from 'next/image'
import CursoActions from "./CursoActions";
import { getPublicStorageUrl } from '@/lib/storage'

export const dynamic = "force-dynamic";

interface Curso {
  id: number
  image: string | null
  image_bucket: string | null
  name: string
  description: string | null
  begining_date: string | null
  capacity: number | null
  state: string
  inscripciones: { count: number }[]
}

export default async function WorkerCursosPage() {
  const supabase = await createSupabaseServer()
  const { data: cursos } = await supabase
    .from("cursos")
    .select(
      "id,image,image_bucket,name,description,begining_date,capacity,state,inscripciones(count)"
    )
    .eq("inscripciones.status", "activa")
    .order("name")
    .returns<Curso[]>()

  const cursosWithImages = cursos?.map(curso => ({
    ...curso,
    imageUrl: getPublicStorageUrl(supabase, curso.image, curso.image_bucket),
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Cursos</h1>
      <table className="min-w-full bg-gray-800 text-sm rounded overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-left">Plazas</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursosWithImages?.map(c => {
            const ocupadas = c.inscripciones?.[0]?.count ?? 0;
            return (
              <tr key={c.id} className="border-t border-gray-700">
                <td className="px-4 py-2">
                  {c.imageUrl ? (
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-700 rounded flex items-center justify-center text-sm text-gray-400 font-semibold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.description}</td>
                <td className="px-4 py-2">
                  {c.begining_date
                    ? new Date(c.begining_date).toLocaleDateString()
                    : ""}
                </td>
                <td className="px-4 py-2">
                  {ocupadas}/{c.capacity ?? 0}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      c.state === "Disponible" ? "bg-green-700" : "bg-gray-600"
                    }`}
                  >
                    {c.state}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <CursoActions id={c.id} state={c.state} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}