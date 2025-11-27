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

import { DELETE } from '@/app/api/reservas/[id]/route'

describe('DELETE /api/reservas/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('devuelve ok cuando la reserva se elimina correctamente', async () => {
    const deleteEqMock = jest.fn().mockResolvedValue({ error: null })
    const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock })
    createSupabaseServer.mockResolvedValue({ from: jest.fn().mockReturnValue({ delete: deleteMock }) })

    const response = await DELETE(new Request('https://example.com/api/reservas/10'), { params: Promise.resolve({ id: '10' }) })

    expect(deleteMock).toHaveBeenCalledTimes(1)
    expect(deleteEqMock).toHaveBeenCalledWith('id', '10')
    expect(jsonSpy).toHaveBeenCalledWith({ ok: true })
    expect(response).toEqual({ body: { ok: true }, init: undefined })
  })

  it('retorna 400 cuando supabase responde con error', async () => {
    const deleteEqMock = jest.fn().mockResolvedValue({ error: { message: 'failed_delete' } })
    const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock })
    createSupabaseServer.mockResolvedValue({ from: jest.fn().mockReturnValue({ delete: deleteMock }) })

    const response = await DELETE(new Request('https://example.com/api/reservas/10'), { params: Promise.resolve({ id: '10' }) })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'failed_delete' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'failed_delete' }, init: { status: 400 } })
  })
})