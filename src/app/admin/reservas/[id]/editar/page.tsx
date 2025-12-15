import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/SubmitButton"
import { Badge } from "@/components/ui/badge"

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

        let status = 'pendiente'
        if (nuevoEstado === 'Confirmada') {
            status = 'activa'
        } else if (nuevoEstado === 'Cancelada') {
            status = 'cancelada'
        }

        await supabaseAdmin
            .from('reservas')
            .update({
                status,
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

    const estadoActual = (reserva.status?.toLowerCase() === 'cancelada')
        ? 'Cancelada'
        : reserva.paid
            ? 'Confirmada'
            : 'Pendiente'

    return (
        <div className="container-padding section-spacing max-w-2xl mx-auto">
            <Link href="/admin/reservas" className="text-sm text-primary hover:underline mb-6 inline-block">
                ← Volver a Reservas
            </Link>

            <h1 className="mb-8">Editar reserva #{reserva.id}</h1>

            <div className="surface p-6 rounded-lg space-y-6">
                {/* Info de solo lectura */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-tertiary block mb-1">Usuario</span>
                        <span className="font-medium">{reserva.users ? `${reserva.users.name} ${reserva.users.surname}` : 'Desconocido'}</span>
                    </div>

                    <div>
                        <span className="text-xs text-tertiary block mb-1">Recinto</span>
                        <span className="font-medium">{reserva.recintos?.name ?? 'Recinto sin nombre'}</span>
                    </div>

                    <div className="md:col-span-2">
                        <span className="text-xs text-tertiary block mb-1">Fecha y Hora</span>
                        <span className="font-medium text-sm">{fechaFormateada}</span>
                    </div>

                    <div>
                        <span className="text-xs text-tertiary block mb-1">Total</span>
                        <span className="font-medium">$ {reserva.price}</span>
                    </div>

                    <div>
                        <span className="text-xs text-tertiary block mb-1">Estado Actual</span>
                        <Badge className={
                            estadoActual === 'Confirmada' ? 'bg-success text-success-foreground' :
                                estadoActual === 'Cancelada' ? 'bg-error text-error-foreground' :
                                    'bg-warning text-warning-foreground'
                        }>
                            {estadoActual}
                        </Badge>
                    </div>
                </div>

                {/* Form con dropdown de estado */}
                <form action={updateReserva} className="space-y-4 pt-4 border-t border-border">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nuevo estado
                        </label>
                        <select
                            name="estado"
                            defaultValue={estadoActual}
                            className="input-base w-full"
                            required
                        >
                            <option value="Confirmada">Confirmada</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <SubmitButton loadingText="Guardando...">Guardar cambios</SubmitButton>
                        <Button asChild variant="outline">
                            <Link href="/admin/reservas">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}