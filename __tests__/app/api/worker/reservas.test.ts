/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/auth/guard', () => ({
  requireAuthAPI: jest.fn(),
}))

jest.mock('@/lib/reservas/conflicts', () => ({
  hasRecintoConflicts: jest.fn(),
}))

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: { __type: 'admin-mock' },
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
const hasRecintoConflictsMock = jest.requireMock('@/lib/reservas/conflicts').hasRecintoConflicts as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { PATCH } from '@/app/api/worker/reservas/[id]/route'

function createSupabaseStub () {
  const currentMaybeSingleMock = jest.fn().mockResolvedValue({
    data: {
      id: 42,
      status: 'pendiente',
      recinto_id: 8,
      start_at: '2025-02-01T10:00:00.000Z',
      end_at: '2025-02-01T11:00:00.000Z',
    },
    error: null,
  })
  const currentEqMock = jest.fn().mockReturnValue({ maybeSingle: currentMaybeSingleMock })
  const currentSelectMock = jest.fn().mockReturnValue({ eq: currentEqMock })

  const updateSingleMock = jest.fn().mockResolvedValue({
    data: {
      id: 42,
      status: 'aprobada',
      worker_uid: 'worker-77',
      reviewed_at: '2025-02-02T00:00:00.000Z',
    },
    error: null,
  })
  const updateSelectMock = jest.fn().mockReturnValue({ single: updateSingleMock })
  const updateEqMock = jest.fn().mockReturnValue({ select: updateSelectMock })
  const updateMock = jest.fn().mockReturnValue({ eq: updateEqMock })

  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'curso_reservas') {
        return {
          select: currentSelectMock,
          update: updateMock,
        }
      }
      throw new Error(`Unexpected table ${table}`)
    }),
  }

  return {
    supabase,
    currentMaybeSingleMock,
    currentEqMock,
    currentSelectMock,
    updateSingleMock,
    updateSelectMock,
    updateEqMock,
    updateMock,
  }
}

describe('PATCH /api/worker/reservas/[id]', () => {
  beforeEach(() => {
    requireAuthAPIMock.mockReset()
    hasRecintoConflictsMock.mockReset()
    jsonSpy.mockReset()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('retorna 409 cuando la reserva aprobada presenta conflictos', async () => {
    const supabaseStub = createSupabaseStub()
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-77', role: 'worker' },
    })

    hasRecintoConflictsMock.mockResolvedValue({ conflict: true, error: null })

    const request = new Request('https://example.com/api/worker/reservas/42', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'aprobada' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '42' }) })

     expect(hasRecintoConflictsMock).toHaveBeenCalledWith(expect.objectContaining({
   supabase: expect.anything(),
   recintoId: 8,
   startAt: '2025-02-01T10:00:00.000Z',
   endAt: '2025-02-01T11:00:00.000Z',
   ignoreCourseReservationId: 42,
   // Acepta al menos 'aprobada' y no fuerza el array completo
   courseStatuses: expect.arrayContaining(['aprobada']),
 }))
    expect(supabaseStub.updateMock).not.toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({
      error: 'El recinto ya está reservado para ese horario',
    }, { status: 409 })
    expect(response).toEqual({
      body: { error: 'El recinto ya está reservado para ese horario' },
      init: { status: 409 },
    })
  })

  it('aprueba la reserva asignando worker y fecha de revisión', async () => {
    const supabaseStub = createSupabaseStub()
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-77', role: 'worker' },
    })

    hasRecintoConflictsMock.mockResolvedValue({ conflict: false, error: null })

    const request = new Request('https://example.com/api/worker/reservas/42', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'aprobada', observations: 'Listo' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '42' }) })

    expect(supabaseStub.updateMock).toHaveBeenCalledWith({
      status: 'aprobada',
      observations: 'Listo',
      worker_uid: 'worker-77',
      reviewed_at: expect.any(String), // fecha actual
    })
    expect(supabaseStub.updateEqMock).toHaveBeenCalledWith('id', 42)
    expect(supabaseStub.updateSelectMock).toHaveBeenCalledWith('*')
    expect(jsonSpy).toHaveBeenCalledWith({
      reserva: {
        id: 42,
        status: 'aprobada',
        worker_uid: 'worker-77',
        reviewed_at: '2025-02-02T00:00:00.000Z',
      },
    })
    expect(response).toEqual({
      body: {
        reserva: {
          id: 42,
          status: 'aprobada',
          worker_uid: 'worker-77',
          reviewed_at: '2025-02-02T00:00:00.000Z',
        },
      },
      init: undefined,
    })
  })

  it('propaga los errores de Supabase al validar conflictos', async () => {
    const supabaseStub = createSupabaseStub()
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'worker-77', role: 'worker' },
    })

    hasRecintoConflictsMock.mockResolvedValue({
      conflict: false,
      error: { message: 'db_error' },
    })

    const request = new Request('https://example.com/api/worker/reservas/42', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'aprobada' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: '42' }) })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'db_error' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'db_error' }, init: { status: 400 } })
  })
})
