import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function ReservaDeletePage ({ params }: Props) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) redirect('/reservas')

  async function deleteReserva () {
    'use server'
    const supabase = await createSupabaseServer()
    await supabase.from('reservas').delete().eq('id', id)
    revalidatePath('/reservas')
    redirect('/reservas')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cancelar reserva</h1>
      <p className="text-sm">¿Estás seguro de cancelar la reserva? Se perderán sus datos.</p>
      <div className="space-x-2">
        <form action={deleteReserva} className="inline">
          <button className="text-red-400" type="submit">Aceptar</button>
        </form>
        <Link href="/reservas" className="text-blue-400">Cancelar</Link>
      </div>
    </div>
  )
}