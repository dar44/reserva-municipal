/**
* @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    auth: { admin: { createUser: jest.fn(), listUsers: jest.fn() }, resetPasswordForEmail: jest.fn() },
  },
}))

jest.mock('@/lib/lemonSqueezy', () => ({
  createCheckout: jest.fn(),
  getInscripcionVariantId: jest.fn().mockReturnValue(99),
  getLemonStoreId: jest.fn().mockReturnValue(1),
}))

jest.mock('@/lib/config', () => ({
  getConfiguredCurrency: jest.fn().mockReturnValue('CLP'),
}))

jest.mock('@/lib/currency', () => ({
  toMinorUnits: jest.fn((price: number) => price * 100),
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

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(),
}))

const supabaseAdmin = jest.requireMock('@/lib/supabaseAdmin').supabaseAdmin as {
  from: jest.Mock
  auth: { admin: { createUser: jest.Mock }, resetPasswordForEmail: jest.Mock }
}
const createSupabaseServer = jest.requireMock('@/lib/supabaseServer').createSupabaseServer as jest.Mock
const createCheckout = jest.requireMock('@/lib/lemonSqueezy').createCheckout as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { POST } from '@/app/api/inscripciones/route'
import { DELETE } from '@/app/api/inscripciones/[id]/route'

describe('API inscripciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createSupabaseServer.mockReset()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('crea checkout para usuario existente y registra pago', async () => {
    const usersMaybeSingle = jest.fn().mockResolvedValue({ data: { uid: 'uid-1' }, error: null })
    const usersEq = jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingle })
    const usersSelect = jest.fn().mockReturnValue({ eq: usersEq })

    const pagosInsertSelect = jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'p1' }, error: null }) })
    const pagosInsert = jest.fn().mockReturnValue({ select: pagosInsertSelect })
    const pagosUpdateEq = jest.fn().mockResolvedValue({})
    const pagosUpdate = jest.fn().mockReturnValue({ eq: pagosUpdateEq })

    const inscripcionesInsertSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 5 }, error: null }),
    })
    const inscripcionesInsert = jest.fn().mockReturnValue({ select: inscripcionesInsertSelect })

    const cursosMaybeSingle = jest.fn().mockResolvedValue({ data: { price: 10 }, error: null })
    const cursosEq = jest.fn().mockReturnValue({ maybeSingle: cursosMaybeSingle })
    const cursosSelect = jest.fn().mockReturnValue({ eq: cursosEq })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return { select: usersSelect }
      if (table === 'inscripciones') return { insert: inscripcionesInsert }
      if (table === 'pagos') return { insert: pagosInsert, update: pagosUpdate }
      if (table === 'cursos') return { select: cursosSelect }
      return {}
    })

    createCheckout.mockResolvedValue({ id: 'chk_1', url: 'https://checkout.url' })

    const request = new Request('https://example.com/api/inscripciones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ curso_id: 123, email: 'user@example.com', newUser: false }),
    })

    const response = await POST(request)

    expect(usersSelect).toHaveBeenCalledWith('uid')
    expect(inscripcionesInsert).toHaveBeenCalledWith({ curso_id: 123, user_uid: 'uid-1' })
    expect(pagosInsert).toHaveBeenCalledWith({
      user_uid: 'uid-1',
      inscripcion_id: 5,
      monto_centavos: 1000,
      moneda: 'CLP',
      estado: 'pendiente',
      gateway: 'lemon_squeezy',
    })
    expect(createCheckout).toHaveBeenCalledWith(expect.objectContaining({
      customPrice: 1000,
      customerEmail: 'user@example.com',
    }))
    expect(pagosUpdate).toHaveBeenCalledWith({ checkout_id: 'chk_1' })
    expect(pagosUpdateEq).toHaveBeenCalledWith('id', 'p1')
    expect(jsonSpy).toHaveBeenCalledWith({ checkoutUrl: 'https://checkout.url', pagoId: 'p1' })
    expect(response).toEqual({ body: { checkoutUrl: 'https://checkout.url', pagoId: 'p1' }, init: undefined })
  })

  it('rechaza cursos sin precio válido', async () => {
    const usersMaybeSingle = jest.fn().mockResolvedValue({ data: { uid: 'uid-2' }, error: null })
    const usersSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }) })
    const cursosSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { price: 0 }, error: null }) }) })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return { select: usersSelect }
      if (table === 'cursos') return { select: cursosSelect }
      return {}
    })

    const request = new Request('https://example.com/api/inscripciones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ curso_id: 55, email: 'empty@example.com', newUser: false }),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'course_price_invalid' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'course_price_invalid' }, init: { status: 400 } })
  })

  it('borra inscripciones y propaga errores', async () => {
    const deleteEqMock = jest.fn().mockResolvedValue({ error: { message: 'failed' } })
    const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock })
    createSupabaseServer.mockResolvedValue({ from: jest.fn().mockReturnValue({ delete: deleteMock }) })

    const response = await DELETE(new Request('https://example.com/api/inscripciones/10'), { params: Promise.resolve({ id: '10' }) })

    expect(deleteMock).toHaveBeenCalledTimes(1)
    expect(deleteEqMock).toHaveBeenCalledWith('id', '10')
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'failed' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'failed' }, init: { status: 400 } })
  })

  it('crea usuario nuevo, asigna redirect y personaliza successUrl para workers', async () => {
    process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = 'https://app.example.com/reset'

    const usersMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null })
    const usersSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }) })

    const cursosSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { price: 15 }, error: null }) }),
    })

    const inscripcionesInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 77 }, error: null }) }),
    })
    const pagosInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 88 }, error: null }) }),
    })
    const pagosUpdate = jest.fn().mockReturnValue({ eq: jest.fn() })

    supabaseAdmin.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'uid-new-ins' } }, error: null })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return { select: usersSelect }
      if (table === 'cursos') return { select: cursosSelect }
      if (table === 'inscripciones') return { insert: inscripcionesInsert }
      if (table === 'pagos') return { insert: pagosInsert, update: pagosUpdate }
      return {}
    })

    createCheckout.mockResolvedValue({ id: 'chk-worker', url: 'https://checkout.worker' })

    const request = new Request('https://example.com/api/inscripciones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        curso_id: 500,
        email: 'new@example.com',
        newUser: true,
        fromWorker: true,
        name: 'Worker',
      }),
    })

    const response = await POST(request)

    expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }))
    expect(supabaseAdmin.auth.resetPasswordForEmail).toHaveBeenCalledWith('new@example.com', {
      redirectTo: 'https://app.example.com/reset',
    })
    expect(createCheckout).toHaveBeenCalledWith({
      variantId: 99,
      storeId: 1,
      customPrice: 1500,
      customerEmail: 'new@example.com',
      successUrl: 'https://example.com/pagos/exito/worker?pago=88&tipo=inscripcion&curso=500',
      cancelUrl: 'https://example.com/pagos/cancelado?pago=88&tipo=inscripcion',
      metadata: { pago_id: 88, tipo: 'inscripcion', inscripcion_id: 77, curso_id: 500 },
    })
    expect(jsonSpy).toHaveBeenCalledWith({ checkoutUrl: 'https://checkout.worker', pagoId: 88 })
    expect(response).toEqual({ body: { checkoutUrl: 'https://checkout.worker', pagoId: 88 }, init: undefined })
  })

  it('revierte inscripcion cuando la inserción de pagos falla', async () => {
    const usersMaybeSingle = jest.fn().mockResolvedValue({ data: { uid: 'u-200' }, error: null })
    const usersSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }) })

    const cursosSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({ data: { price: 12 }, error: null }),
      }),
    })

    const deleteEqMock = jest.fn().mockResolvedValue({})
    const inscripcionesDelete = jest.fn().mockReturnValue({ eq: deleteEqMock })

    const inscripcionesInsertSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 300 }, error: null }),
    })
    const inscripcionesInsert = jest.fn().mockReturnValue({ select: inscripcionesInsertSelect })

    const pagosInsertSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'insert_failed' },
      }),
    })
    const pagosInsert = jest.fn().mockReturnValue({ select: pagosInsertSelect })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return { select: usersSelect }
      if (table === 'cursos') return { select: cursosSelect }
      if (table === 'inscripciones') return {
        insert: inscripcionesInsert,
        delete: inscripcionesDelete,        // <- delete cuelga de from('inscripciones')
      }
      if (table === 'pagos') return { insert: pagosInsert }
      return {}
    })

    const request = new Request('https://example.com/api/inscripciones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ curso_id: 12, email: 'existing@example.com', newUser: false }),
    })

    const response = await POST(request)

    expect(deleteEqMock).toHaveBeenCalledWith('id', 300)
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'insert_failed' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'insert_failed' }, init: { status: 400 } })
  })

    it('elimina pago e inscripcion cuando el checkout falla', async () => {
    const usersMaybeSingle = jest.fn().mockResolvedValue({ data: { uid: 'u-400' }, error: null })
    const usersSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingle }),
    })

    const cursosSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({ data: { price: 8 }, error: null }),
      }),
    })

    const inscripcionesDeleteEq = jest.fn().mockResolvedValue({})
    const pagosDeleteEq = jest.fn().mockResolvedValue({})

    const inscripcionesDelete = jest.fn().mockReturnValue({ eq: inscripcionesDeleteEq })
    const pagosDelete = jest.fn().mockReturnValue({ eq: pagosDeleteEq })

    const inscripcionesInsertSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 700 }, error: null }),
    })
    const inscripcionesInsert = jest.fn().mockReturnValue({ select: inscripcionesInsertSelect })

    const pagosInsertSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 701 }, error: null }),
    })
    const pagosInsert = jest.fn().mockReturnValue({ select: pagosInsertSelect })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return { select: usersSelect }
      if (table === 'cursos') return { select: cursosSelect }
      if (table === 'inscripciones') return {
        insert: inscripcionesInsert,
        delete: inscripcionesDelete,            
      }
      if (table === 'pagos') return {
        insert: pagosInsert,
        delete: pagosDelete,                    
      }
      return {}
    })

    createCheckout.mockRejectedValue(new Error('lemon_down'))

    const request = new Request('https://example.com/api/inscripciones', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ curso_id: 41, email: 'existing@example.com', newUser: false }),
    })

    const response = await POST(request)

    expect(pagosDeleteEq).toHaveBeenCalledWith('id', 701)
    expect(inscripcionesDeleteEq).toHaveBeenCalledWith('id', 700)
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'lemon_down' }, { status: 500 })
    expect(response).toEqual({ body: { error: 'lemon_down' }, init: { status: 500 } })
  })

})