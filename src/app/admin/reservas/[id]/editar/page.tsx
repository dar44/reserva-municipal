import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

type ReservaDetail = {
    id: number
    start_at: string
    end_at: string
    price: number
    status: string | null
    paid: boolean
    users: { name: string; surname: string } | null
    recintos: { name: string } | null
}

export default async function EditReservaPage({ params }: Props) {
    const { id } = await params

    const { data: reserva } = await supabaseAdmin
        .from('reservas')
        .select('id,start_at,end_at,price,status,paid,users(name,surname),recintos(name)')
        .eq('id', id)
        .single<ReservaDetail>()

    if (!reserva) redirect('/admin/reservas')

    async function updateReserva(formData: FormData) {
        'use server'

        const nuevoEstado = String(formData.get('estado') || 'Pendiente')
        const paid = nuevoEstado === 'Confirmada'

        await supabaseAdmin
            .from('reservas')
            .update({
                status: paid ? 'activa' : 'pendiente',
                paid,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        revalidatePath('/admin/reservas')
        revalidatePath(`/admin/reservas/${id}/editar`)
        redirect('/admin/reservas')
    }

    const startDate = new Date(reserva.start_at)
    const endDate = new Date(reserva.end_at)
    const fechaFormateada = `${startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`

    const estadoActual = reserva.paid ? 'Confirmada' : 'Pendiente'

    return (
        <div className="space-y-4">
            <Link href="/admin/reservas" className="text-sm underline">← Volver</Link>
            <h1 className="text-2xl font-bold">Editar reserva #{reserva.id}</h1>

            <div className="bg-gray-800 p-6 rounded space-y-4">
                {/* Usuario */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Usuario</span>
                    <span className="font-medium">{reserva.users ? `${reserva.users.name} ${reserva.users.surname}` : 'Desconocido'}</span>
                </div>

                {/* Nombre (Recinto) */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Nombre</span>
                    <span className="font-medium">{reserva.recintos?.name ?? 'Recinto sin nombre'}</span>
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Fecha</span>
                    <span className="font-medium">{fechaFormateada}</span>
                </div>

                {/* Total */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="font-medium">$ {reserva.price}</span>
                </div>

                {/* Form con dropdown de estado */}
                <form action={updateReserva} className="space-y-4 pt-4 border-t border-gray-700">
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