import { NextResponse } from 'next/server'
import { AuthorizationError, isRole } from '@/lib/auth/roles'
import { requireAuthAPI } from '@/lib/auth/guard'
import type { CourseInput, Curso } from '@/lib/models/cursos'

export const dynamic = 'force-dynamic'

function sanitizeCoursePayload (body: Partial<CourseInput>): CourseInput {
  const base: CourseInput = {
    name: body.name?.trim() ?? '',
    description: body.description ?? null,
    location: body.location ?? null,
    begining_date: body.begining_date ?? null,
    end_date: body.end_date ?? null,
    price: body.price ?? 0,
    capacity: body.capacity ?? 0,
    image: body.image ?? null,
    state: body.state ?? 'Disponible',
    organizer_uid: body.organizer_uid,
  }

  if (!base.name) {
    throw new Error('El nombre del curso es obligatorio')
  }

  return base
}

export async function GET (req: Request) {
  const auth = await requireAuthAPI(['admin', 'organizer', 'worker'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {

    const { searchParams } = new URL(req.url)
    const organizerParam = searchParams.get('organizer_uid') ?? undefined

    let query = supabase
      .from('cursos')
      .select('*')
      .order('created_at', { ascending: false })

    if (isRole(profile, 'organizer')) {
      query = query.eq('organizer_uid', profile.uid)
    } else if (organizerParam) {
      query = query.eq('organizer_uid', organizerParam)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ cursos: data as Curso[] })
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar cursos' }, { status: 500 })
  }
}

export async function POST (req: Request) {
  const auth = await requireAuthAPI(['organizer', 'admin'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {

    const payload = await req.json().catch(() => ({}))
    const sanitized = sanitizeCoursePayload(payload)

    const organizerUid = isRole(profile, 'organizer')
      ? profile.uid
      : sanitized.organizer_uid ?? profile.uid

    const { data, error } = await supabase
      .from('cursos')
      .insert({
        name: sanitized.name,
        description: sanitized.description,
        location: sanitized.location,
        begining_date: sanitized.begining_date,
        end_date: sanitized.end_date,
        price: sanitized.price,
        capacity: sanitized.capacity,
        image: sanitized.image,
        state: sanitized.state,
        organizer_uid: organizerUid,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ curso: data as Curso }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear curso'
    const status = error instanceof AuthorizationError ? error.status : 400
    return NextResponse.json({ error: message }, { status })
  }
}