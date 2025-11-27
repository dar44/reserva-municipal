/**
 * @jest-environment node
 */

describe('POST /api/lemon/webhook', () => {
  let POST: (req: Request) => Promise<any>
  let jsonSpy: jest.Mock
  let verifyWebhookSignatureMock: jest.Mock
  let notifyPagoConfirmadoMock: jest.Mock
  let supabaseAdminMocks: any

  beforeEach(async () => {
    jest.resetModules()
    process.env.LEMONSQUEEZY_DISABLE_SIGNATURE = 'false'

    jest.doMock('next/server', () => {
      const actual = jest.requireActual('next/server')
      return {
        ...actual,
        NextResponse: {
          ...actual.NextResponse,
          json: jest.fn((body: any, init?: { status?: number }) => ({ body, init })),
        },
      }
    })

    jest.doMock('@/lib/lemonSqueezy', () => ({
      verifyWebhookSignature: jest.fn(() => true),
    }))

    jest.doMock('@/lib/emailNotifications', () => ({
      notifyPagoConfirmado: jest.fn(() => Promise.resolve()),
    }))

    jest.doMock('@/lib/supabaseAdmin', () => {
      const webhookMaybeSingleMock = jest.fn().mockResolvedValue({ data: null, error: null })
      const webhookSelectEqMock = jest.fn(() => ({ maybeSingle: webhookMaybeSingleMock }))
      const webhookSelectMock = jest.fn(() => ({ eq: webhookSelectEqMock }))
      const webhookInsertMock = jest.fn().mockResolvedValue(undefined)

      const pagoState = {
        row: {
          id: 'pago-1',
          estado: 'pendiente',
          order_id: null,
          monto_centavos: 3000,
          moneda: 'CLP',
          reserva_id: 12,
          inscripcion_id: null,
        },
      }
      const pagosMaybeSingleMock = jest.fn().mockImplementation(() => Promise.resolve({ data: pagoState.row, error: null }))
      const pagosSelectEqMock = jest.fn(() => ({ maybeSingle: pagosMaybeSingleMock }))
      const pagosSelectMock = jest.fn(() => ({ eq: pagosSelectEqMock }))
      const pagosUpdateEqMock = jest.fn().mockResolvedValue(undefined)
      const pagosUpdateMock = jest.fn(() => ({ eq: pagosUpdateEqMock }))

      const reservasUpdateEqMock = jest.fn().mockResolvedValue(undefined)
      const reservasUpdateMock = jest.fn(() => ({ eq: reservasUpdateEqMock }))

      const inscripcionesUpdateEqMock = jest.fn().mockResolvedValue(undefined)
      const inscripcionesUpdateMock = jest.fn(() => ({ eq: inscripcionesUpdateEqMock }))

      const supabaseAdmin = {
        from: jest.fn((table: string) => {
          if (table === 'webhook_events') {
            return { select: webhookSelectMock, insert: webhookInsertMock }
          }
          if (table === 'pagos') {
            return { select: pagosSelectMock, update: pagosUpdateMock }
          }
          if (table === 'reservas') {
            return { update: reservasUpdateMock }
          }
          if (table === 'inscripciones') {
            return { update: inscripcionesUpdateMock }
          }
          throw new Error(`Unexpected table ${table}`)
        }),
        auth: { admin: {}, resetPasswordForEmail: jest.fn() },
      }

      return {
        __esModule: true,
        supabaseAdmin,
        __mock: {
          webhookMaybeSingleMock,
          webhookInsertMock,
          pagosMaybeSingleMock,
          pagosUpdateMock,
          pagosUpdateEqMock,
          reservasUpdateEqMock,
          reservasUpdateMock,
          inscripcionesUpdateEqMock,
          pagoState,
        },
      }
    })

    const route = await import('@/app/api/lemon/webhook/route')
    POST = route.POST

    const nextServer = jest.requireMock('next/server')
    jsonSpy = nextServer.NextResponse.json as jest.Mock
    verifyWebhookSignatureMock = jest.requireMock('@/lib/lemonSqueezy').verifyWebhookSignature as jest.Mock
    notifyPagoConfirmadoMock = jest.requireMock('@/lib/emailNotifications').notifyPagoConfirmado as jest.Mock
    supabaseAdminMocks = jest.requireMock('@/lib/supabaseAdmin').__mock
  })

  it('rechaza peticiones con firma inválida', async () => {
    verifyWebhookSignatureMock.mockReturnValue(false)

    const request = new Request('https://example.com/api/lemon/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-signature': 'bad' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'invalid_signature' }, { status: 401 })
    expect(response).toEqual({ body: { error: 'invalid_signature' }, init: { status: 401 } })
  })

  it('actualiza el pago y la reserva cuando se confirma el cobro', async () => {
    supabaseAdminMocks.pagoState.row = {
      id: 'pago-99',
      estado: 'pendiente',
      order_id: null,
      monto_centavos: 1000,
      moneda: 'CLP',
      reserva_id: 55,
      inscripcion_id: null,
    }

    const body = {
      meta: {
        event_name: 'subscription_payment_success',
        webhook_id: 'evt-1',
        custom_data: { pago_id: 'pago-99', reserva_id: 55 },
      },
      data: {
        id: 'order-123',
        attributes: { status: 'paid', total: 1000, currency: 'CLP' },
      },
    }

    const request = new Request('https://example.com/api/lemon/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-signature': 'good' },
      body: JSON.stringify(body),
    })

    const response = await POST(request)

    expect(verifyWebhookSignatureMock).toHaveBeenCalled()
    expect(supabaseAdminMocks.pagosUpdateEqMock).toHaveBeenCalledWith('id', 'pago-99')
    expect(supabaseAdminMocks.pagosMaybeSingleMock).toHaveBeenCalled()
    expect(supabaseAdminMocks.pagosUpdateMock).toHaveBeenCalled()
    expect(supabaseAdminMocks.reservasUpdateEqMock).toHaveBeenCalledWith('id', 55)
    expect(supabaseAdminMocks.reservasUpdateMock).toHaveBeenCalledWith({ paid: true })
    expect(supabaseAdminMocks.webhookInsertMock).toHaveBeenCalled()
    expect(notifyPagoConfirmadoMock).toHaveBeenCalledWith({
      previousEstado: 'pendiente',
      nextEstado: 'pagado',
      reservaId: 55,
      inscripcionId: null,
    })
    const [pagoUpdates] = supabaseAdminMocks.pagosUpdateMock.mock.calls[0]
    expect(pagoUpdates).toMatchObject({
      estado: 'pagado',
      order_id: 'order-123',
      monto_centavos: 1000,
      moneda: 'CLP',
    })
    expect(jsonSpy).toHaveBeenCalledWith({ ok: true, estado: 'pagado', orderId: 'order-123' })
    expect(response).toEqual({ body: { ok: true, estado: 'pagado', orderId: 'order-123' }, init: undefined })
  })
})