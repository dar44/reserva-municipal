/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/auth/guard', () => ({
  requireAuthAPI: jest.fn(),
}))

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: jest.fn(),
    },
  }
})

const requireAuthAPIMock = jest.requireMock('@/lib/auth/guard').requireAuthAPI as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { GET, POST } from '@/app/api/organizer/cursos/route'

type SupabaseCursosStubOptions = {
  cursosData?: Array<Record<string, any>> | null
  cursosError?: { message: string } | null
  insertData?: Record<string, any> | null
  insertError?: { message: string } | null
}

function createSupabaseCursosStub (options: SupabaseCursosStubOptions = {}) {
  const cursosResult = {
    data: options.cursosData ?? [],
    error: options.cursosError ?? null,
  }

  const insertResult = {
    data: options.insertData ?? { id: 99, organizer_uid: 'org-1', name: 'Nuevo curso' },
    error: options.insertError ?? null,
  }

  // Builder encadenable y "awaitable"
  const cursosBuilder: any = {}

  cursosBuilder.select = jest.fn(() => cursosBuilder)
  cursosBuilder.eq = jest.fn(() => cursosBuilder)
  cursosBuilder.order = jest.fn(() => cursosBuilder)

  // Para que `await cursosBuilder` devuelva cursosResult
  cursosBuilder.then = (resolve: (value: typeof cursosResult) => void, _reject?: (reason: any) => void) => {
    return resolve(cursosResult)
  }

  // Builder para insert().select().single()
  const singleMock = jest.fn().mockResolvedValue(insertResult)
  const insertSelectMock = jest.fn(() => ({ single: singleMock }))
  const insertMock = jest.fn(() => ({ select: insertSelectMock }))

  const supabase = {
    from: jest.fn((table: string) => {
      if (table !== 'cursos') {
        throw new Error(`Unexpected table ${table}`)
      }
      return {
        select: cursosBuilder.select,
        eq: cursosBuilder.eq,
        order: cursosBuilder.order,
        insert: insertMock,
      }
    }),
  }

  return {
    supabase,
    cursosEqMock: cursosBuilder.eq as jest.Mock,
    cursosOrderMock: cursosBuilder.order as jest.Mock,
    insertMock,
    insertSelectMock,
    singleMock,
  }
}

describe('/api/organizer/cursos route', () => {
  beforeEach(() => {
    requireAuthAPIMock.mockReset()
    jsonSpy.mockReset()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('filtra los resultados GET al organizador autenticado (ignora query param)', async () => {
    const supabaseStub = createSupabaseCursosStub({
      cursosData: [{ id: 1, organizer_uid: 'org-1' }],
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-1', role: 'organizer' },
    })

    const response = await GET(
      new Request('http://example.com/api/organizer/cursos?organizer_uid=other'),
    )

    expect(requireAuthAPIMock).toHaveBeenCalledWith(['admin', 'organizer', 'worker'])

    // Si la ruta aplica el filtro por el perfil del organizador,
    // debería llamar a eq con el uid del perfil.
    expect(supabaseStub.cursosEqMock).toHaveBeenCalledWith('organizer_uid', 'org-1')

    expect(jsonSpy).toHaveBeenCalledWith(
      { cursos: [{ id: 1, organizer_uid: 'org-1' }] },
    )

    expect(response).toEqual({
      body: { cursos: [{ id: 1, organizer_uid: 'org-1' }] },
      init: undefined,
    })
  })

  it('permite a admin/worker filtrar GET por organizer_uid de la query cuando no es organizer', async () => {
    const cursosResult = [{ id: 3, organizer_uid: 'org-x' }]
    const supabaseStub = createSupabaseCursosStub({
      cursosData: cursosResult,
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'admin-9', role: 'admin' },
    })

    const response = await GET(
      new Request('http://example.com/api/organizer/cursos?organizer_uid=org-x'),
    )

    // Aquí esperamos que el filtro se aplique con el organizer_uid de la query
    expect(supabaseStub.cursosEqMock).toHaveBeenCalledWith('organizer_uid', 'org-x')

    expect(jsonSpy).toHaveBeenCalledWith({ cursos: cursosResult })
    expect(response).toEqual({ body: { cursos: cursosResult }, init: undefined })
  })

  it('retorna 500 cuando Supabase GET lanza un error', async () => {
    const supabaseStub = createSupabaseCursosStub()

    // Hacemos que la llamada a order() reviente
    supabaseStub.cursosOrderMock.mockImplementationOnce(() => {
      throw new Error('select failed')
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-1', role: 'organizer' },
    })

    const response = await GET(new Request('http://example.com/api/organizer/cursos'))

    // La implementación actual de la ruta captura el error genérico y responde 500
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Error al consultar cursos' },
      { status: 500 },
    )

    expect(response).toEqual({
      body: { error: 'Error al consultar cursos' },
      init: { status: 500 },
    })
  })

  it('crea un curso como organizador forzando su propio uid', async () => {
    const insertData = { id: 99, organizer_uid: 'org-1', name: 'Nuevo curso' }
    const supabaseStub = createSupabaseCursosStub({
      insertData,
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-1', role: 'organizer' },
    })

    const request = new Request('http://example.com/api/organizer/cursos', {
      method: 'POST',
      body: JSON.stringify({ name: ' Nuevo curso ', organizer_uid: 'other' }),
    })

    const response = await POST(request)

    expect(supabaseStub.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizer_uid: 'org-1',
        name: 'Nuevo curso',
      }),
    )

    expect(jsonSpy).toHaveBeenCalledWith(
      { curso: insertData },
      { status: 201 },
    )

    expect(response).toEqual({
      body: { curso: insertData },
      init: { status: 201 },
    })
  })

  it('propaga los errores de validación del sanitizador', async () => {
    const supabaseStub = createSupabaseCursosStub()

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-1', role: 'organizer' },
    })

    const request = new Request('http://example.com/api/organizer/cursos', {
      method: 'POST',
      body: JSON.stringify({}), // sin nombre => debe fallar sanitizador
    })

    await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'El nombre del curso es obligatorio' },
      { status: 400 },
    )
  })

  it('return 400 cuando el insert de Supabase falla', async () => {
    const supabaseStub = createSupabaseCursosStub({
      insertData: null,
      insertError: { message: 'insert failed' },
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-1', role: 'organizer' },
    })

    const request = new Request('http://example.com/api/organizer/cursos', {
      method: 'POST',
      body: JSON.stringify({ name: 'Curso roto' }),
    })

    await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'insert failed' },
      { status: 400 },
    )
  })
})
