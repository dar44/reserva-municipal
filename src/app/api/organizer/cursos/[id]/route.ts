import { NextResponse } from 'next/server'
import { AuthorizationError, assertRole, isRole } from '@/lib/auth/roles'
import { requireAuthAPI } from '@/lib/auth/guard'
import type { CourseInput, Curso } from '@/lib/models/cursos'

export const dynamic = 'force-dynamic'

function parseCourseId (params: { id: string }): number {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    throw new AuthorizationError('Identificador de curso inválido', 400)
  }
  return id
}

function sanitizeUpdatePayload (body: Partial<CourseInput>): Partial<CourseInput> {
  const payload: Partial<CourseInput> = {}

  if (typeof body.name === 'string') payload.name = body.name.trim()
  if ('description' in body) payload.description = body.description ?? null
  if ('location' in body) payload.location = body.location ?? null
  if ('begining_date' in body) payload.begining_date = body.begining_date ?? null
  if ('end_date' in body) payload.end_date = body.end_date ?? null
  if ('price' in body && body.price !== undefined) payload.price = Number(body.price)
  if ('capacity' in body && body.capacity !== undefined) payload.capacity = Number(body.capacity)
  if ('image' in body) payload.image = body.image ?? null
  if ('state' in body && body.state) payload.state = body.state
  if ('organizer_uid' in body && body.organizer_uid) payload.organizer_uid = body.organizer_uid

  return payload
}

export async function GET (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['admin', 'organizer', 'worker'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {
    const { id: rawId } = await params
    const id = parseCourseId({ id: rawId })

    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    if (
      !isRole(profile, 'admin', 'worker') &&
      data.organizer_uid !== profile.uid
    ) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    return NextResponse.json({ curso: data as Curso })
  } catch (error) {
    console.error('GET /api/organizer/cursos/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 500
    return NextResponse.json({ error: 'Error al obtener el curso' }, { status })
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['admin', 'organizer'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {
    const { id: rawId } = await params
    const id = parseCourseId({ id: rawId })

    const payload = await req.json().catch(() => ({}))
    const sanitized = sanitizeUpdatePayload(payload)

    if (isRole(profile, 'organizer')) {
      sanitized.organizer_uid = profile.uid
    } else {
      assertRole(profile, ['admin'])
    }

    const { data, error } = await supabase
      .from('cursos')
      .update(sanitized)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ curso: data as Curso })
  } catch (error) {
    console.error('PATCH /api/organizer/cursos/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al actualizar el curso'
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAPI(['admin', 'organizer'])
  if ('error' in auth) {
    return auth.error
  }

  const { supabase, profile } = auth

  try {
    const { id: rawId } = await params
    const id = parseCourseId({ id: rawId })

    if (!isRole(profile, 'organizer', 'admin')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const filter = isRole(profile, 'organizer')
      ? { id, organizer_uid: profile.uid }
      : { id }

    const { error } = await supabase
      .from('cursos')
      .delete()
      .match(filter)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/organizer/cursos/[id]', error)
    const status = error instanceof AuthorizationError ? error.status : 400
    const message = error instanceof Error ? error.message : 'Error al eliminar el curso'
    return NextResponse.json({ error: message }, { status })
  }
}