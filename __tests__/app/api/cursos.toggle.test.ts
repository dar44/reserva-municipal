/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(),
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

const createSupabaseServer = jest.requireMock('@/lib/supabaseServer').createSupabaseServer as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { POST } from '@/app/api/cursos/[id]/toggle/route'

describe('POST /api/cursos/[id]/toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('devuelve 404 cuando el curso no existe', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'missing' } })
    const eqMock = jest.fn().mockReturnValue({ single: singleMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    createSupabaseServer.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: selectMock }) })

    const response = await POST(new Request('https://example.com/api/cursos/1/toggle', { method: 'POST' }), { params: Promise.resolve({ id: '1' }) })

    expect(singleMock).toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'missing' }, { status: 404 })
    expect(response).toEqual({ body: { error: 'missing' }, init: { status: 404 } })
  })

  it('invierte el estado y devuelve el nuevo valor', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: { state: 'Disponible' }, error: null })
    const eqMock = jest.fn().mockReturnValue({ single: singleMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })

    const updateEqMock = jest.fn().mockResolvedValue({ error: null })
    const updateMock = jest.fn().mockReturnValue({ eq: updateEqMock })

    createSupabaseServer.mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === 'cursos') {
          return { select: selectMock, update: updateMock }
        }
        return {}
      }),
    })

    const response = await POST(new Request('https://example.com/api/cursos/2/toggle', { method: 'POST' }), { params: Promise.resolve({ id: '2' }) })

    expect(updateMock).toHaveBeenCalledWith({ state: 'No disponible' })
    expect(updateEqMock).toHaveBeenCalledWith('id', '2')
    expect(jsonSpy).toHaveBeenCalledWith({ state: 'No disponible' })
    expect(response).toEqual({ body: { state: 'No disponible' }, init: undefined })
  })
})