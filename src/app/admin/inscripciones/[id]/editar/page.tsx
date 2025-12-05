import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

type InscripcionDetail = {
    id: number
    user_uid: string
    curso_id: number
    status: string | null
    paid: boolean
    users: { name: string; surname: string } | null
    cursos: { name: string; price: number } | null
}

export default async function EditInscripcionPage({ params }: Props) {
    const { id } = await params

    const { data: inscripcion, error } = await supabaseAdmin
        .from('inscripciones')
        .select('id,user_uid,curso_id,status,paid,users!inscripciones_user_uid_fkey(name,surname),cursos(name,price)')
        .eq('id', id)
        .single<InscripcionDetail>()

    if (error) {
        console.error('Error fetching inscripcion:', error)
    }

    if (!inscripcion) redirect('/admin/reservas')

    async function updateInscripcion(formData: FormData) {
        'use server'

        const paid = formData.get('paid') === 'on'

        await supabaseAdmin
            .from('inscripciones')
            .update({
                status: paid ? 'activa' : 'pendiente',
                paid,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        revalidatePath('/admin/reservas')
        revalidatePath(`/admin/inscripciones/${id}/editar`)
        redirect('/admin/reservas')
    }

    return (
        <div className="space-y-4">
            <Link href="/admin/reservas" className="text-sm underline">← Volver</Link>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Editar inscripción #{inscripcion.id}</h1>
                <span className="px-2 py-1 rounded bg-gray-800 text-xs">
                    {inscripcion.cursos?.name ?? 'Curso sin nombre'}
                </span>
            </div>

            <div className="bg-gray-800 p-4 rounded text-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Usuario</span>
                        <span className="font-medium">{inscripcion.users ? `${inscripcion.users.name} ${inscripcion.users.surname}` : 'Desconocido'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Curso</span>
                        <span className="font-medium">{inscripcion.cursos?.name || 'Curso desconocido'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Precio</span>
                        <span className="font-medium">$ {inscripcion.cursos?.price || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Estado actual</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${inscripcion.paid
                            ? 'bg-green-900 text-green-300'
                            : 'bg-yellow-900 text-yellow-300'
                            }`}>
                            {inscripcion.paid ? 'Confirmada' : 'Pendiente'}
                        </span>
                    </div>
                </div>

                <form action={updateInscripcion} className="space-y-3">
                    <div className="border-t border-gray-700 pt-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                name="paid"
                                type="checkbox"
                                defaultChecked={inscripcion.paid}
                                className="h-4 w-4 accent-blue-600"
                            />
                            <span>Marcar como pagado (cambiará el estado a confirmada)</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Guardar cambios</button>
                        <Link href="/admin/reservas" className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
