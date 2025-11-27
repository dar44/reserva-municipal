/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

// Silenciamos los console.error solo en este archivo de test
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  (console.error as jest.Mock).mockRestore()
})

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

import { GET } from '@/app/api/organizer/cursos/[id]/route'

function createSupabaseStub (options: {
  data?: Record<string, any> | null
  error?: { message: string } | null
} = {}) {
  const maybeSingleMock = jest.fn().mockResolvedValue({
    data: options.data ?? { id: 10, organizer_uid: 'org-1', name: 'Curso X' },
    error: options.error ?? null,
  })

  const eqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock })

  const supabase = {
    from: jest.fn((table: string) => {
      if (table !== 'cursos') throw new Error(`Unexpected table ${table}`)
      return { select: selectMock }
    }),
  }

  return { supabase, maybeSingleMock, eqMock, selectMock }
}

describe('GET /api/organizer/cursos/[id] (worker)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('permite a un worker consultar un curso existente', async () => {
    const supabaseStub = createSupabaseStub()
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-1', role: 'worker' },
    })

    const response = await GET(new Request('https://example.com/api/organizer/cursos/10'), {
      params: Promise.resolve({ id: '10' }),
    })

    expect(requireAuthAPIMock).toHaveBeenCalledWith(['admin', 'organizer', 'worker'])
    expect(supabaseStub.selectMock).toHaveBeenCalledWith('*')
    expect(supabaseStub.eqMock).toHaveBeenCalledWith('id', 10)
    expect(supabaseStub.maybeSingleMock).toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ curso: { id: 10, organizer_uid: 'org-1', name: 'Curso X' } })
    expect(response).toEqual({ body: { curso: { id: 10, organizer_uid: 'org-1', name: 'Curso X' } }, init: undefined })
  })

  it('bloquea a un organizer cuando intenta leer un curso de otro organizer', async () => {
    const supabaseStub = createSupabaseStub({
      data: { id: 5, organizer_uid: 'org-real' },
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-2', role: 'organizer' },
    })

    const response = await GET(new Request('https://example.com/api/organizer/cursos/5'), {
      params: Promise.resolve({ id: '5' }),
    })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'Acceso denegado' }, { status: 403 })
    expect(response).toEqual({ body: { error: 'Acceso denegado' }, init: { status: 403 } })
  })

  it('propaga errores de Supabase al resolver el curso', async () => {
    const supabaseStub = createSupabaseStub({ data: null, error: { message: 'db failed' } })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-1', role: 'worker' },
    })

    const response = await GET(new Request('https://example.com/api/organizer/cursos/8'), {
      params: Promise.resolve({ id: '8' }),
    })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'db failed' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'db failed' }, init: { status: 400 } })
  })

  it('devuelve 400 cuando el id no es numérico', async () => {
    const supabaseStub = createSupabaseStub()
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-1', role: 'worker' },
    })

    const response = await GET(new Request('https://example.com/api/organizer/cursos/abc'), {
      params: Promise.resolve({ id: 'abc' }),
    })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'Error al obtener el curso' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'Error al obtener el curso' }, init: { status: 400 } })
  })
})