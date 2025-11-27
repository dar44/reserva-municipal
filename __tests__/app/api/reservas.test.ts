/**
 * @jest-environment node
 */

describe('POST /api/reservas (JSON)', () => {
  // ----- helpers para construir tablas mock -----
  type UsersTableMock = {
    select: jest.Mock
    eqMock: jest.Mock
    maybeSingleMock: jest.Mock
  }
  type ReservasTableMock = {
    insert: jest.Mock
    selectMock: jest.Mock
    singleMock: jest.Mock
    delete: jest.Mock
    deleteEqMock: jest.Mock
  }
  type PagosTableMock = {
    insert: jest.Mock
    selectMock: jest.Mock
    singleMock: jest.Mock
    delete: jest.Mock
    deleteEqMock: jest.Mock
    update: jest.Mock
    updateEqMock: jest.Mock
  }

  function createUsersTable(result: unknown): UsersTableMock {
    const maybeSingleMock = jest.fn().mockResolvedValue(result)
    const eqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
    const select = jest.fn().mockReturnValue({ eq: eqMock })
    return { select, eqMock, maybeSingleMock }
  }
  function createReservasTable(result: unknown): ReservasTableMock {
    const singleMock = jest.fn().mockResolvedValue(result)
    const selectMock = jest.fn().mockReturnValue({ single: singleMock })
    const insert = jest.fn().mockReturnValue({ select: selectMock })
    const deleteEqMock = jest.fn().mockResolvedValue(undefined)
    const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock })
    return { insert, selectMock, singleMock, delete: deleteMock, deleteEqMock }
  }
  function createPagosTable(result: unknown): PagosTableMock {
    const singleMock = jest.fn().mockResolvedValue(result)
    const selectMock = jest.fn().mockReturnValue({ single: singleMock })
    const insert = jest.fn().mockReturnValue({ select: selectMock })
    const deleteEqMock = jest.fn().mockResolvedValue(undefined)
    const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock })
    const updateEqMock = jest.fn().mockResolvedValue(undefined)
    const update = jest.fn().mockReturnValue({ eq: updateEqMock })
    return { insert, selectMock, singleMock, delete: deleteMock, deleteEqMock, update, updateEqMock }
  }

  // ----- variables que rellenaremos tras doMock/import -----
  let supabaseAdminMock: any
  let hasRecintoConflictsMock: jest.Mock
  let createCheckoutMock: jest.Mock
  let getLemonStoreIdMock: jest.Mock
  let createSupabaseServerMock: jest.Mock
  let getReservaVariantIdMock: jest.Mock
  let toMinorUnitsMock: jest.Mock
  let getConfiguredCurrencyMock: jest.Mock
  let getReservaPriceValueMock: jest.Mock
  let jsonSpy: jest.Mock
  let POST: (req: Request) => Promise<any>

  // ----- cada test arranca con módulos limpios y mocks dinámicos -----
  beforeEach(async () => {
    jest.resetModules()

    // Env ya la pones con setupFiles, pero repetimos por seguridad en este suite
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://supabase.test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key'
    process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL ?? 'https://app.example.com/reset'

    // next/server -> espiamos json()
    jest.doMock('next/server', () => {
      const actual = jest.requireActual('next/server')
      return {
        ...actual,
        NextResponse: { ...actual.NextResponse, json: jest.fn() },
      }
    })

    // supabaseAdmin con registro de tablas
    jest.doMock('@/lib/supabaseAdmin', () => {
      const tables: Record<string, any> = {}
      const createUser = jest.fn()
      const updateUserById = jest.fn()
      const resetPasswordForEmail = jest.fn()
      const fromMock = jest.fn((table: string) => {
        if (!tables[table]) throw new Error(`No mock registered for table ${table}`)
        return tables[table]
      })
      return {
        __esModule: true,
        supabaseAdmin: {
          auth: {
            admin: { createUser, updateUserById },
            resetPasswordForEmail,
          },
          from: fromMock,
        },
        __mock: {
          env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
          createUser,
          updateUserById,
          resetPasswordForEmail,
          fromMock,
          registerTable: (table: string, builder: unknown) => { tables[table] = builder },
          clearTables: () => { Object.keys(tables).forEach(k => delete tables[k]) },
        },
      }
    })

    // resto de módulos
    jest.doMock('@/lib/reservas/conflicts', () => ({ hasRecintoConflicts: jest.fn() }))
    jest.doMock('@/lib/lemonSqueezy', () => ({
      createCheckout: jest.fn(),
      getLemonStoreId: jest.fn(),
      getReservaVariantId: jest.fn(),
    }))
    jest.doMock('@/lib/supabaseServer', () => ({
      createSupabaseServer: jest.fn(),
    }))
    jest.doMock('@/lib/currency', () => ({ toMinorUnits: jest.fn() }))
    jest.doMock('@/lib/config', () => ({
      getConfiguredCurrency: jest.fn(),
      getReservaPriceValue: jest.fn(),
    }))

    // imports después de mockear
    const supabaseAdminModule = await import('@/lib/supabaseAdmin')
    supabaseAdminMock = (supabaseAdminModule as any).__mock

    const conflicts = await import('@/lib/reservas/conflicts')
    hasRecintoConflictsMock = conflicts.hasRecintoConflicts as jest.Mock

    const lemon = await import('@/lib/lemonSqueezy')
    createCheckoutMock = lemon.createCheckout as jest.Mock
    getLemonStoreIdMock = lemon.getLemonStoreId as jest.Mock
    getReservaVariantIdMock = lemon.getReservaVariantId as jest.Mock

    const supabaseServer = await import('@/lib/supabaseServer')
    createSupabaseServerMock = supabaseServer.createSupabaseServer as jest.Mock

    const currency = await import('@/lib/currency')
    toMinorUnitsMock = currency.toMinorUnits as jest.Mock

    const cfg = await import('@/lib/config')
    getConfiguredCurrencyMock = cfg.getConfiguredCurrency as jest.Mock
    getReservaPriceValueMock = cfg.getReservaPriceValue as jest.Mock

    const { NextResponse } = await import('next/server')
    jsonSpy = (NextResponse as any).json as jest.Mock
    jsonSpy.mockReset()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))

    const route = await import('@/app/api/reservas/route')
    POST = route.POST

    // valores por defecto
    getLemonStoreIdMock.mockReturnValue(101)
    getReservaVariantIdMock.mockReturnValue(202)
    toMinorUnitsMock.mockReturnValue(7500)
    getConfiguredCurrencyMock.mockReturnValue('CLP')
    getReservaPriceValueMock.mockReturnValue(75)
    supabaseAdminMock.clearTables()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('valida las variables de entorno requeridas por el mock', () => {
    expect(supabaseAdminMock.env).toEqual({
      url: 'https://supabase.test',
      serviceRoleKey: 'service-role-key',
    })
  })

  it('retorna 409 cuando existe un conflicto de horario', async () => {
    hasRecintoConflictsMock.mockImplementation(async (options) => {
      expect(options.includeCitizenReservations ?? true).toBe(true)
      expect(options.includeCourseReservations ?? true).toBe(true)
      return { conflict: true }
    })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: false,
      }),
    })

    const response = await POST(request)

    expect(hasRecintoConflictsMock).toHaveBeenCalledWith({
      supabase: expect.anything(),
      recintoId: 12,
      startAt: '2025-01-15T10:30:00.000Z',
      endAt: '2025-01-15T11:30:00.000Z',
      courseStatuses: ['pendiente', 'aprobada'],
    })
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Ese horario ya está reservado. Por favor elige otro horario.' },
      { status: 409 }
    )
    expect(response).toEqual({
      body: { error: 'Ese horario ya está reservado. Por favor elige otro horario.' },
      init: { status: 409 },
    })
    expect(supabaseAdminMock.fromMock).not.toHaveBeenCalled()
  })

  it('retorna 400 cuando la verificación de conflictos falla', async () => {
    hasRecintoConflictsMock.mockResolvedValue({
      conflict: false,
      error: { message: 'database_unreachable' },
    })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: false,
      }),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ error: 'database_unreachable' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'database_unreachable' }, init: { status: 400 } })
    expect(supabaseAdminMock.fromMock).not.toHaveBeenCalled()
  })

  it('usa un usuario existente sin crear cuentas nuevas', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })

    const usersTable = createUsersTable({ data: { uid: 'existing-1' }, error: null })
    const reservasTable = createReservasTable({ data: { id: 77 }, error: null })
    const pagosTable = createPagosTable({ data: { id: 88 }, error: null })

    supabaseAdminMock.registerTable('users', { select: usersTable.select })
    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    createCheckoutMock.mockResolvedValue({ id: 'chk-1', url: 'https://checkout.example/1' })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: false,
        name: 'Ada',
        surname: 'Lovelace',
        dni: '1-9',
        phone: '+56',
      }),
    })

    const response = await POST(request)

    // Llamadas no frágiles
    expect(getConfiguredCurrencyMock).toHaveBeenCalled()
    expect(getReservaPriceValueMock).toHaveBeenCalled()
    expect(toMinorUnitsMock).toHaveBeenCalledWith(75, 'CLP')

    expect(usersTable.select).toHaveBeenCalledWith('uid')
    expect(usersTable.eqMock).toHaveBeenCalledWith('email', 'user@example.com')
    expect(usersTable.maybeSingleMock).toHaveBeenCalled()
    expect(supabaseAdminMock.createUser).not.toHaveBeenCalled()

    expect(reservasTable.insert).toHaveBeenCalledWith({
      user_uid: 'existing-1',
      recinto_id: 12,
      price: 75,
      start_at: '2025-01-15T10:30:00.000Z',
      end_at: '2025-01-15T11:30:00.000Z',
    })
    expect(pagosTable.insert).toHaveBeenCalledWith({
      user_uid: 'existing-1',
      reserva_id: 77,
      monto_centavos: 7500,
      moneda: 'CLP',
      estado: 'pendiente',
      gateway: 'lemon_squeezy',
    })
    expect(createCheckoutMock).toHaveBeenCalledWith({
      variantId: 202,
      storeId: 101,
      customPrice: 7500,
      customerEmail: 'user@example.com',
      successUrl: 'https://example.com/pagos/exito?pago=88&tipo=reserva',
      cancelUrl: 'https://example.com/pagos/cancelado?pago=88&tipo=reserva',
      metadata: { pago_id: 88, tipo: 'reserva', reserva_id: 77 },
    })
    expect(pagosTable.update).toHaveBeenCalledWith({ checkout_id: 'chk-1' })
    expect(pagosTable.updateEqMock).toHaveBeenCalledWith('id', 88)

    // handler sin segundo argumento
    expect(jsonSpy).toHaveBeenCalledWith({ checkoutUrl: 'https://checkout.example/1', pagoId: 88 })
    expect(response).toEqual({ body: { checkoutUrl: 'https://checkout.example/1', pagoId: 88 }, init: undefined })
  })

  it('crea un nuevo usuario y dispara el email de reseteo', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })

    const usersTable = createUsersTable({ data: null, error: null })
    const reservasTable = createReservasTable({ data: { id: 77 }, error: null })
    const pagosTable = createPagosTable({ data: { id: 88 }, error: null })

    supabaseAdminMock.registerTable('users', { select: usersTable.select })
    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    supabaseAdminMock.createUser.mockResolvedValue({ data: { user: { id: 'uid-new' } }, error: null })
    createCheckoutMock.mockResolvedValue({ id: 'chk-2', url: 'https://checkout.example/2' })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: true,
        name: 'Grace',
        surname: 'Hopper',
        dni: '2-7',
        phone: '+569',
      }),
    })

    await POST(request)

    expect(supabaseAdminMock.createUser).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: expect.any(String),
      email_confirm: true,
      user_metadata: { name: 'Grace', surname: 'Hopper', dni: '2-7', phone: '+569' },
      app_metadata: { role: 'citizen' },
    })
    expect(supabaseAdminMock.resetPasswordForEmail).toHaveBeenCalledWith('new@example.com', {
      redirectTo: 'https://app.example.com/reset',
    })
  })

  it('elimina la reserva cuando el pago falla tras crear un usuario nuevo', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })

    const usersTable = createUsersTable({ data: null, error: null })
    const reservasTable = createReservasTable({ data: { id: 901 }, error: null })
    const pagosTable = createPagosTable({ data: null, error: { message: 'payment_down' } })

    supabaseAdminMock.registerTable('users', { select: usersTable.select })
    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    supabaseAdminMock.createUser.mockResolvedValue({ data: { user: { id: 'uid-new-3' } }, error: null })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'fresh@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: true,
        name: 'New',
        surname: 'Citizen',
        dni: '9-9',
        phone: '+56',
      }),
    })

    const response = await POST(request)

    expect(supabaseAdminMock.createUser).toHaveBeenCalled()
    expect(supabaseAdminMock.resetPasswordForEmail).toHaveBeenCalledWith('fresh@example.com', {
      redirectTo: 'https://app.example.com/reset',
    })
    expect(pagosTable.insert).toHaveBeenCalledWith({
      user_uid: 'uid-new-3',
      reserva_id: 901,
      monto_centavos: 7500,
      moneda: 'CLP',
      estado: 'pendiente',
      gateway: 'lemon_squeezy',
    })
    expect(reservasTable.deleteEqMock).toHaveBeenCalledWith('id', 901)
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'payment_down' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'payment_down' }, init: { status: 400 } })
  })

  it('ejecuta rollback cuando la inserción de pagos falla', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })

    const usersTable = createUsersTable({ data: { uid: 'existing-2' }, error: null })
    const reservasTable = createReservasTable({ data: { id: 90 }, error: null })
    const pagosTable = createPagosTable({ data: null, error: { message: 'insert_failed' } })

    supabaseAdminMock.registerTable('users', { select: usersTable.select })
    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: false,
      }),
    })

    const response = await POST(request)

    expect(pagosTable.insert).toHaveBeenCalled()
    expect(reservasTable.deleteEqMock).toHaveBeenCalledWith('id', 90)
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'insert_failed' }, { status: 400 })
    expect(response).toEqual({ body: { error: 'insert_failed' }, init: { status: 400 } })
  })

  it('realiza rollback de pagos y reservas cuando el checkout falla', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })

    const usersTable = createUsersTable({ data: { uid: 'existing-3' }, error: null })
    const reservasTable = createReservasTable({ data: { id: 55 }, error: null })
    const pagosTable = createPagosTable({ data: { id: 66 }, error: null })

    supabaseAdminMock.registerTable('users', { select: usersTable.select })
    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    createCheckoutMock.mockRejectedValue(new Error('lemon_fail'))

    const request = new Request('https://example.com/api/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        date: '2025-01-15',
        time: '10:30',
        recinto_id: 12,
        newUser: false,
      }),
    })

    const response = await POST(request)

    expect(pagosTable.deleteEqMock).toHaveBeenCalledWith('id', 66)
    expect(reservasTable.deleteEqMock).toHaveBeenCalledWith('id', 55)
    expect(pagosTable.update).not.toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'lemon_fail' }, { status: 500 })
    expect(response).toEqual({ body: { error: 'lemon_fail' }, init: { status: 500 } })
  })
  it('rechaza peticiones form-data sin sesión iniciada', async () => {
    createSupabaseServerMock.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    })

    const form = new FormData()
    form.set('recinto_id', '44')
    form.set('date', '2025-06-01')
    form.set('slot', '12:00-13:00')

    const response = await POST(new Request('https://example.com/api/reservas', { method: 'POST', body: form }))

    expect(createSupabaseServerMock).toHaveBeenCalled()
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'not_authenticated' }, { status: 401 })
    expect(response).toEqual({ body: { error: 'not_authenticated' }, init: { status: 401 } })
  })

  it('crea reservas desde form-data con usuario autenticado', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })
    createSupabaseServerMock.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-1', email: 'auth@example.com' } } }) },
    })

    const reservasTable = createReservasTable({ data: { id: 333 }, error: null })
    const pagosTable = createPagosTable({ data: { id: 444 }, error: null })

    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    createCheckoutMock.mockResolvedValue({ id: 'chk-form', url: 'https://checkout/form' })

    const form = new FormData()
    form.set('recinto_id', '44')
    form.set('date', '2025-06-01')
    form.set('slot', '12:30-13:30')

    const response = await POST(new Request('https://example.com/api/reservas', { method: 'POST', body: form }))

    expect(reservasTable.insert).toHaveBeenCalledWith({
      user_uid: 'auth-1',
      recinto_id: 44,
      price: 75,
      start_at: '2025-06-01T12:30:00.000Z',
      end_at: '2025-06-01T13:30:00.000Z',
    })
    expect(pagosTable.insert).toHaveBeenCalledWith({
      user_uid: 'auth-1',
      reserva_id: 333,
      monto_centavos: 7500,
      moneda: 'CLP',
      estado: 'pendiente',
      gateway: 'lemon_squeezy',
    })
    expect(createCheckoutMock).toHaveBeenCalledWith({
      variantId: 202,
      storeId: 101,
      customPrice: 7500,
      customerEmail: 'auth@example.com',
      successUrl: 'https://example.com/pagos/exito?pago=444&tipo=reserva',
      cancelUrl: 'https://example.com/pagos/cancelado?pago=444&tipo=reserva',
      metadata: { pago_id: 444, tipo: 'reserva', reserva_id: 333 },
    })
    expect(pagosTable.update).toHaveBeenCalledWith({ checkout_id: 'chk-form' })
    expect(jsonSpy).toHaveBeenCalledWith({ checkoutUrl: 'https://checkout/form', pagoId: 444 })
    expect(response).toEqual({ body: { checkoutUrl: 'https://checkout/form', pagoId: 444 }, init: undefined })
  })

  it('hace rollback de reservas y pagos en form-data cuando el checkout falla', async () => {
    hasRecintoConflictsMock.mockResolvedValue({ conflict: false })
    createSupabaseServerMock.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-2', email: 'citizen@example.com' } } }) },
    })

    const reservasTable = createReservasTable({ data: { id: 501 }, error: null })
    const pagosTable = createPagosTable({ data: { id: 502 }, error: null })

    supabaseAdminMock.registerTable('reservas', { insert: reservasTable.insert, delete: reservasTable.delete })
    supabaseAdminMock.registerTable('pagos', { insert: pagosTable.insert, delete: pagosTable.delete, update: pagosTable.update })

    createCheckoutMock.mockRejectedValue(new Error('lemon_down'))

    const form = new FormData()
    form.set('recinto_id', '22')
    form.set('date', '2025-06-02')
    form.set('slot', '09:00-10:00')

    const response = await POST(new Request('https://example.com/api/reservas', { method: 'POST', body: form }))

    expect(pagosTable.deleteEqMock).toHaveBeenCalledWith('id', 502)
    expect(reservasTable.deleteEqMock).toHaveBeenCalledWith('id', 501)
    expect(jsonSpy).toHaveBeenCalledWith({ error: 'lemon_down' }, { status: 500 })
    expect(response).toEqual({ body: { error: 'lemon_down' }, init: { status: 500 } })
  })
})
