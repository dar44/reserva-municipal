/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.test',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
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

const cookiesMock = jest.requireMock('next/headers').cookies as jest.Mock
const createServerClientMock = jest.requireMock('@supabase/ssr').createServerClient as jest.Mock
const jsonSpy = NextResponse.json as jest.Mock

import { POST } from '@/app/api/login/route'

describe('POST /api/login', () => {
  let cookieJar: { get: jest.Mock }
  let cookieCallbacks: {
    get: (name: string) => string | undefined
    set: jest.Mock
    remove: jest.Mock
  }
  let signInWithPasswordMock: jest.Mock
  let usersMaybeSingleMock: jest.Mock
  let usersEqMock: jest.Mock
  let usersSelectMock: jest.Mock
  let responseCookiesSet: jest.Mock

  beforeEach(() => {
    cookieJar = { get: jest.fn() }
    cookiesMock.mockResolvedValue(cookieJar)

    cookieCallbacks = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    }

    signInWithPasswordMock = jest.fn()
    usersMaybeSingleMock = jest.fn()
    usersEqMock = jest.fn().mockReturnValue({ maybeSingle: usersMaybeSingleMock })
    usersSelectMock = jest.fn().mockReturnValue({ eq: usersEqMock })

    const fromMock = jest.fn().mockReturnValue({ select: usersSelectMock })

    createServerClientMock.mockImplementation((url: string, key: string, options: { cookies: typeof cookieCallbacks }) => {
      expect(url).toBe('https://supabase.test')
      expect(key).toBe('anon-key')
      cookieCallbacks = options.cookies
      return {
        auth: {
          signInWithPassword: signInWithPasswordMock,
        },
        from: fromMock,
      }
    })

    jsonSpy.mockReset()
    responseCookiesSet = jest.fn()
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({
      body,
      init,
      cookies: { set: responseCookiesSet },
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('propaga el error de autenticación y aplica las cookies pendientes', async () => {
    signInWithPasswordMock.mockImplementation(async (credentials) => {
      expect(credentials).toEqual({ email: 'user@example.com', password: 'hunter2' })
      cookieCallbacks.set('sb-access-token', 'token', { path: '/', httpOnly: true })
      return { data: { user: null }, error: { message: 'Invalid credentials' } }
    })

    const request = new Request('https://example.com/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'hunter2' }),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ message: 'Invalid credentials' }, { status: 401 })
    expect(responseCookiesSet).toHaveBeenCalledWith('sb-access-token', 'token', { path: '/', httpOnly: true })
    expect(usersSelectMock).not.toHaveBeenCalled()
    expect(response).toEqual({
      body: { message: 'Invalid credentials' },
      init: { status: 401 },
      cookies: { set: responseCookiesSet },
    })
  })

  it('devuelve 200 con el rol obtenido y setea sm_role junto con las cookies de Supabase', async () => {
    signInWithPasswordMock.mockImplementation(async (credentials) => {
      expect(credentials).toEqual({ email: 'admin@example.com', password: 'secret' })
      cookieCallbacks.set('sb-refresh-token', 'refresh', { path: '/', httpOnly: true })
      return { data: { user: { id: 'uid-123' } }, error: null }
    })

    usersMaybeSingleMock.mockResolvedValue({ data: { uid: 'uid-123', role: 'organizer' }, error: null })

    const request = new Request('https://example.com/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
    })

    const response = await POST(request)

    expect(usersSelectMock).toHaveBeenCalledWith('uid, email, role')
    expect(usersEqMock).toHaveBeenCalledWith('uid', 'uid-123')
    expect(usersMaybeSingleMock).toHaveBeenCalledTimes(1)
    expect(jsonSpy).toHaveBeenCalledWith({ message: 'login_ok', role: 'organizer' }, { status: 200 })
    expect(responseCookiesSet).toHaveBeenCalledWith('sb-refresh-token', 'refresh', { path: '/', httpOnly: true })
    expect(responseCookiesSet).toHaveBeenCalledWith('sm_role', 'organizer', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    expect(response).toEqual({
      body: { message: 'login_ok', role: 'organizer' },
      init: { status: 200 },
      cookies: { set: responseCookiesSet },
    })
  })

  it('usa citizen como rol por defecto cuando la consulta de users falla', async () => {
    signInWithPasswordMock.mockResolvedValue({ data: { user: { id: 'uid-999' } }, error: null })
    usersMaybeSingleMock.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const request = new Request('https://example.com/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@example.com', password: 'secret' }),
    })

    const response = await POST(request)

    expect(jsonSpy).toHaveBeenCalledWith({ message: 'login_ok', role: 'citizen' }, { status: 200 })
    expect(responseCookiesSet).toHaveBeenCalledWith('sm_role', 'citizen', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    expect(response).toEqual({
      body: { message: 'login_ok', role: 'citizen' },
      init: { status: 200 },
      cookies: { set: responseCookiesSet },
    })
  })
})