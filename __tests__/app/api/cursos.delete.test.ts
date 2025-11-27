/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
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
const revalidatePath = jest.requireMock('next/cache').revalidatePath as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { DELETE } from '@/app/api/cursos/[id]/route'

describe('DELETE /api/cursos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('elimina el curso y revalida el listado cuando no hay errores', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null })
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock })
    const fromMock = jest.fn().mockReturnValue({ delete: deleteMock })
    createSupabaseServer.mockResolvedValue({ from: fromMock })

    const response = await DELETE(new Request('https://example.com/api/cursos/20'), {
      params: Promise.resolve({ id: '20' }),
    })

    expect(fromMock).toHaveBeenCalledWith('cursos')
    expect(deleteMock).toHaveBeenCalled()
    expect(eqMock).toHaveBeenCalledWith('id', '20')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/cursos')
    expect(jsonSpy).toHaveBeenCalledWith({ ok: true })
    expect(response).toEqual({ body: { ok: true }, init: undefined })
  })

  it('retorna 400 cuando Supabase devuelve un error', async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: { message: 'delete failed' } })
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock })
    const fromMock = jest.fn().mockReturnValue({ delete: deleteMock })
    createSupabaseServer.mockResolvedValue({ from: fromMock })

    const response = await DELETE(new Request('https://example.com/api/cursos/99'), {
      params: Promise.resolve({ id: '99' }),
    })

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'delete failed' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'delete failed' }, init: { status: 400 } })
  })
})