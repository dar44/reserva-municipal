/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: { from: jest.fn() },
}))

jest.mock('@/lib/lemonSqueezy', () => ({
  getCheckoutStatus: jest.fn(),
  getOrder: jest.fn(),
  findOrderByCheckoutId: jest.fn(),
}))

jest.mock('@/lib/emailNotifications', () => ({
  notifyPagoConfirmado: jest.fn(),
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

const supabaseAdmin = jest.requireMock('@/lib/supabaseAdmin').supabaseAdmin as { from: jest.Mock }
const getCheckoutStatus = jest.requireMock('@/lib/lemonSqueezy').getCheckoutStatus as jest.Mock
const findOrderByCheckoutId = jest.requireMock('@/lib/lemonSqueezy').findOrderByCheckoutId as jest.Mock
const notifyPagoConfirmado = jest.requireMock('@/lib/emailNotifications').notifyPagoConfirmado as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { GET } from '@/app/api/pagos/[id]/route'

describe('GET /api/pagos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('devuelve 404 si el pago no existe', async () => {
    const selectMock = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: null }) }) })
    supabaseAdmin.from.mockReturnValue({ select: selectMock })

    const response = await GET(new Request('https://example.com/api/pagos/abc'), { params: Promise.resolve({ id: 'abc' }) })

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'pago_not_found' }, { status: 404 })
    expect(response).toEqual({ body: { error: 'pago_not_found' }, init: { status: 404 } })
  })

  it('sincroniza pagos pendientes usando Lemon y marca reservas como pagadas', async () => {
    const pagoRecord = {
      id: 'p1',
      estado: 'pendiente',
      checkout_id: 'chk_123',
      order_id: null,
      reserva_id: 42,
      inscripcion_id: null,
    }

    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: pagoRecord, error: null }),
      }),
    })

    const pagosUpdateEqMock = jest.fn().mockResolvedValue({})
    const reservasUpdateEqMock = jest.fn().mockResolvedValue({})

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'pagos') {
        return {
          select: selectMock,
          update: jest.fn().mockReturnValue({ eq: pagosUpdateEqMock }),
        }
      }
      if (table === 'reservas') {
        return {
          update: jest.fn().mockReturnValue({ eq: reservasUpdateEqMock }),
        }
      }
      return {}
    })

    getCheckoutStatus.mockResolvedValue({ status: 'paid', orderId: 'ord_1' })
    findOrderByCheckoutId.mockResolvedValue(null)

    const response = await GET(new Request('https://example.com/api/pagos/p1'), { params: Promise.resolve({ id: 'p1' }) })

    expect(getCheckoutStatus).toHaveBeenCalledWith('chk_123')
    expect(pagosUpdateEqMock).toHaveBeenCalledWith('id', 'p1')
    expect(reservasUpdateEqMock).toHaveBeenCalledWith('id', 42)
    expect(notifyPagoConfirmado).toHaveBeenCalledWith({
      previousEstado: 'pendiente',
      nextEstado: 'pagado',
      reservaId: 42,
      inscripcionId: null,
    })
    expect(jsonSpy).toHaveBeenCalledWith({ pagoId: 'p1', estado: 'pagado', orderId: 'ord_1', synced: true })
    expect(response).toEqual({ body: { pagoId: 'p1', estado: 'pagado', orderId: 'ord_1', synced: true }, init: undefined })
  })

  it('devuelve estado pendiente sin sincronizar cuando no hay checkout id', async () => {
    const pagoRecord = { id: 'p2', estado: 'pendiente', checkout_id: null, order_id: null, reserva_id: null, inscripcion_id: null }
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: pagoRecord, error: null }) }),
    })

    supabaseAdmin.from.mockReturnValue({ select: selectMock })

    const response = await GET(new Request('https://example.com/api/pagos/p2'), { params: Promise.resolve({ id: 'p2' }) })

    expect(getCheckoutStatus).not.toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ pagoId: 'p2', estado: 'pendiente' })
    expect(response).toEqual({ body: { pagoId: 'p2', estado: 'pendiente' }, init: undefined })
  })
})