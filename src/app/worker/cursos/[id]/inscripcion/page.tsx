import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function InscripcionCurso({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServer();
  const { data: curso } = await supabase
    .from("cursos")
    .select("id,name")
    .eq("id", params.id)
    .single();

  if (!curso) return notFound();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inscripción en Curso</h1>
        <Link href="/worker/cursos" className="text-sm underline">Volver</Link>
      </div>
      <div className="bg-gray-800 p-4 rounded space-y-3">
        <div className="bg-gray-700 px-3 py-1 rounded text-sm font-semibold">Curso: {curso.name}</div>
        <p className="text-sm">¿El participante tiene cuenta en el sistema?</p>
        <div className="flex gap-2">
          <button type="button" className="px-3 py-1 bg-blue-600 rounded text-xs">Sí, ya está registrado</button>
          <button type="button" className="px-3 py-1 bg-gray-600 rounded text-xs">No, crear nueva cuenta</button>
        </div>
        <input type="email" placeholder="Correo electrónico" className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
        <button className="w-full bg-blue-600 py-2 rounded">Completar Inscripción</button>
      </div>
    </div>
  );
}