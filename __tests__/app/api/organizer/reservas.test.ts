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

import { POST } from '@/app/api/organizer/reservas/route'

function createSupabaseStub(options: {
  curso?: { id: number; organizer_uid: string } | null
  cursoError?: { message: string } | null
  insertData?: Array<Record<string, any>> | null
  insertError?: { message: string } | null
}) {
  const cursoMaybeSingleMock = jest.fn().mockResolvedValue({
    data: options.curso ?? { id: 10, organizer_uid: 'org-allowed' },
    error: options.cursoError ?? null,
  })
  const cursosEqMock = jest.fn().mockReturnValue({ maybeSingle: cursoMaybeSingleMock })
  const cursosSelectMock = jest.fn().mockReturnValue({ eq: cursosEqMock })

  const insertSelectMock = jest.fn().mockResolvedValue({
    data: options.insertData ?? [],
    error: options.insertError ?? null,
  })
  const insertMock = jest.fn().mockReturnValue({ select: insertSelectMock })

  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'cursos') {
        return { select: cursosSelectMock }
      }
      if (table === 'curso_reservas') {
        return {
          insert: insertMock,
        }
      }
      throw new Error(`Unexpected table ${table}`)
    }),
  }

  return {
    supabase,
    cursosSelectMock,
    cursosEqMock,
    cursoMaybeSingleMock,
    insertMock,
    insertSelectMock,
  }
}

describe('POST /api/organizer/reservas', () => {
  beforeEach(() => {
    requireAuthAPIMock.mockReset()
    hasRecintoConflictsMock.mockReset()
    jsonSpy.mockReset()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('crea reservas para un organizador y retorna los bloques ordenados', async () => {
    const blocksFromDb = [
      {
        id: 2,
        start_at: '2025-01-08T10:15:00.000Z',
        end_at: '2025-01-08T14:45:00.000Z',
      },
      {
        id: 1,
        start_at: '2025-01-06T10:15:00.000Z',
        end_at: '2025-01-06T14:45:00.000Z',
      },
    ]
    const supabaseStub = createSupabaseStub({
      insertData: blocksFromDb,
      curso: { id: 33, organizer_uid: 'org-123' },
    })

    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-123', role: 'organizer' },
    })

    hasRecintoConflictsMock.mockResolvedValue({ conflict: false, error: null })

    const request = new Request('https://example.com/api/organizer/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        curso_id: 33,
        recinto_id: 44,
        start_date: '2025-01-06',
        end_date: '2025-01-08',
        start_time: '10:15',
        end_time: '14:45',
        days_of_week: [1, 3],
        observations: 'Necesitamos proyector',
      }),
    })

    const response = await POST(request)

    expect(supabaseStub.insertMock).toHaveBeenCalledWith([
      {
        curso_id: 33,
        organizer_uid: 'org-123',
        recinto_id: 44,
        start_at: '2025-01-06T09:15:00.000Z',
        end_at: '2025-01-06T13:45:00.000Z',
        request_reason: 'Necesitamos proyector',
      },
      {
        curso_id: 33,
        organizer_uid: 'org-123',
        recinto_id: 44,
        start_at: '2025-01-08T09:15:00.000Z',
        end_at: '2025-01-08T13:45:00.000Z',
        request_reason: 'Necesitamos proyector',
      },
    ])

    expect(jsonSpy).toHaveBeenCalledWith({
      reservas: [
        {
          id: 1,
          start_at: '2025-01-06T10:15:00.000Z',
          end_at: '2025-01-06T14:45:00.000Z',
        },
        {
          id: 2,
          start_at: '2025-01-08T10:15:00.000Z',
          end_at: '2025-01-08T14:45:00.000Z',
        },
      ],
    }, { status: 201 })

    expect(response).toEqual({
      body: {
        reservas: [
          {
            id: 1,
            start_at: '2025-01-06T10:15:00.000Z',
            end_at: '2025-01-06T14:45:00.000Z',
          },
          {
            id: 2,
            start_at: '2025-01-08T10:15:00.000Z',
            end_at: '2025-01-08T14:45:00.000Z',
          },
        ],
      },
      init: { status: 201 },
    })
  })

  it('rechaza la reserva cuando existe un conflicto ciudadano', async () => {
    const supabaseStub = createSupabaseStub({
      curso: { id: 33, organizer_uid: 'org-123' },
    })
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-123', role: 'organizer' },
    })

    hasRecintoConflictsMock.mockImplementation(async (options) => {
      expect(options.includeCitizenReservations ?? true).toBe(true)
      return { conflict: true, error: null }
    })

    const request = new Request('https://example.com/api/organizer/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        curso_id: 33,
        recinto_id: 44,
        start_date: '2025-01-06',
        end_date: '2025-01-06',
        start_time: '10:00',
        end_time: '11:00',
        days_of_week: [1],
      }),
    })

    const response = await POST(request)

    expect(supabaseStub.insertMock).not.toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({
      error: 'El recinto ya está reservado para ese horario',
    }, { status: 409 })
    expect(response).toEqual({
      body: { error: 'El recinto ya está reservado para ese horario' },
      init: { status: 409 },
    })
  })

  it('propaga errores de Supabase al comprobar conflictos', async () => {
    const supabaseStub = createSupabaseStub({
      curso: { id: 33, organizer_uid: 'org-123' },
    })
    requireAuthAPIMock.mockResolvedValue({
      supabase: supabaseStub.supabase,
      profile: { uid: 'org-123', role: 'organizer' },
    })

    hasRecintoConflictsMock.mockResolvedValue({
      conflict: false,
      error: { message: 'db_timeout' },
    })

    const request = new Request('https://example.com/api/organizer/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        curso_id: 33,
        recinto_id: 44,
        start_date: '2025-01-06',
        end_date: '2025-01-06',
        start_time: '10:00',
        end_time: '11:00',
        days_of_week: [1],
      }),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'db_timeout' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'db_timeout' }, init: { status: 400 } })
  })
})