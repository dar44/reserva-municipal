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
    cursos: {
        name: string
        price: number
        begining_date: string
        end_date: string
    } | null
}

export default async function EditInscripcionPage({ params }: Props) {
    const { id } = await params

    const { data: inscripcion, error } = await supabaseAdmin
        .from('inscripciones')
        .select('id,user_uid,curso_id,status,paid,users!inscripciones_user_uid_fkey(name,surname),cursos(name,price,begining_date,end_date)')
        .eq('id', id)
        .single<InscripcionDetail>()

    if (error) {
        console.error('Error fetching inscripcion:', error)
    }

    if (!inscripcion) redirect('/admin/reservas')

    async function updateInscripcion(formData: FormData) {
        'use server'

        const nuevoEstado = String(formData.get('estado') || 'Pendiente')
        const paid = nuevoEstado === 'Confirmada'

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

    const beginDate = inscripcion.cursos?.begining_date ? new Date(inscripcion.cursos.begining_date) : null
    const endDate = inscripcion.cursos?.end_date ? new Date(inscripcion.cursos.end_date) : null
    const fechaFormateada = beginDate && endDate
        ? `${beginDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${endDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
        : '-'

    const estadoActual = inscripcion.paid ? 'Confirmada' : 'Pendiente'

    return (
        <div className="space-y-4">
            <Link href="/admin/reservas" className="text-sm underline">← Volver</Link>
            <h1 className="text-2xl font-bold">Editar inscripción #{inscripcion.id}</h1>

            <div className="bg-gray-800 p-6 rounded space-y-4">
                {/* Usuario */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Usuario</span>
                    <span className="font-medium">{inscripcion.users ? `${inscripcion.users.name} ${inscripcion.users.surname}` : 'Desconocido'}</span>
                </div>

                {/* Nombre (Curso) */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Nombre</span>
                    <span className="font-medium">{inscripcion.cursos?.name ?? 'Curso sin nombre'}</span>
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Fecha</span>
                    <span className="font-medium">{fechaFormateada}</span>
                </div>

                {/* Total */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="font-medium">$ {inscripcion.cursos?.price || 0}</span>
                </div>

                {/* Form con dropdown de estado */}
                <form action={updateInscripcion} className="space-y-4 pt-4 border-t border-gray-700">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Nuevo estado</span>
                        <select
                            name="estado"
                            defaultValue={estadoActual}
                            className="rounded bg-gray-700 px-3 py-2"
                            required
                        >
                            <option value="Confirmada">Confirmada</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </label>

                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Guardar cambios</button>
                        <Link href="/admin/reservas" className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
