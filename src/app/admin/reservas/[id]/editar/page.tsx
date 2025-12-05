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

function formatDateInput(value: string) {
    const date = new Date(value)
    return date.toISOString().slice(0, 10)
}

function formatTimeInput(value: string) {
    const date = new Date(value)
    return date.toISOString().slice(11, 16)
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

        const date = String(formData.get('date') || '')
        const startTime = String(formData.get('startTime') || '')
        const endTime = String(formData.get('endTime') || '')
        const price = Number(formData.get('price') || 0)
        const paid = formData.get('paid') === 'on'

        const start_at = new Date(`${date}T${startTime}`)
        const end_at = new Date(`${date}T${endTime}`)

        await supabaseAdmin
            .from('reservas')
            .update({
                start_at: start_at.toISOString(),
                end_at: end_at.toISOString(),
                price,
                status: paid ? 'activa' : 'pendiente',
                paid,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        revalidatePath('/admin/reservas')
        revalidatePath(`/admin/reservas/${id}/editar`)
        redirect('/admin/reservas')
    }

    const startDateValue = formatDateInput(reserva.start_at)
    const startTimeValue = formatTimeInput(reserva.start_at)
    const endTimeValue = formatTimeInput(reserva.end_at)

    return (
        <div className="space-y-4">
            <Link href="/admin/reservas" className="text-sm underline">← Volver</Link>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Editar reserva #{reserva.id}</h1>
                <span className="px-2 py-1 rounded bg-gray-800 text-xs">
                    {reserva.recintos?.name ?? 'Recinto sin nombre'}
                </span>
            </div>

            <div className="bg-gray-800 p-4 rounded text-sm space-y-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Usuario</span>
                    <span className="font-medium">{reserva.users ? `${reserva.users.name} ${reserva.users.surname}` : 'Desconocido'}</span>
                </div>

                <form action={updateReserva} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Fecha</span>
                            <input
                                name="date"
                                type="date"
                                defaultValue={startDateValue}
                                className="rounded bg-gray-700 px-3 py-2"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Precio (€)</span>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={reserva.price}
                                className="rounded bg-gray-700 px-3 py-2"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Hora de inicio</span>
                            <input
                                name="startTime"
                                type="time"
                                defaultValue={startTimeValue}
                                className="rounded bg-gray-700 px-3 py-2"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Hora de fin</span>
                            <input
                                name="endTime"
                                type="time"
                                defaultValue={endTimeValue}
                                className="rounded bg-gray-700 px-3 py-2"
                                required
                            />
                        </label>
                        <label className="flex items-center gap-2 text-sm col-span-full">
                            <input
                                name="paid"
                                type="checkbox"
                                defaultChecked={reserva.paid}
                                className="h-4 w-4 accent-blue-600"
                            />
                            <span>Marcar como pagado (cambiará el estado a confirmada)</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Guardar cambios</button>
                        <Link href="/admin/reservas" className="px-4 py-2 rounded bg-gray-700">Cancelar</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}