import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createSupabaseServer()

    // 1. Obtener estado actual
    const { data: recinto, error: fetchError } = await supabase
        .from('recintos')
        .select('state')
        .eq('id', id)
        .single()

    if (fetchError || !recinto) {
        return NextResponse.json({ error: 'Recinto no encontrado' }, { status: 404 })
    }

    // 2. Calcular nuevo estado
    const newState = recinto.state === 'Disponible' ? 'No disponible' : 'Disponible'

    // 3. Actualizar
    const { error: updateError } = await supabase
        .from('recintos')
        .update({ state: newState })
        .eq('id', id)

    if (updateError) {
        return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
    }

    return NextResponse.json({ success: true, newState })
}
