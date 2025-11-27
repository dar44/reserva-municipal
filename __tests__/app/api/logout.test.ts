/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const ORIGINAL_ENV = process.env

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

import { POST } from '@/app/api/logout/route'

describe('POST /api/logout', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()

    const cookieStore = { set: jest.fn(), get: jest.fn() }
    cookiesMock.mockResolvedValue(cookieStore)

    createServerClientMock.mockImplementation((_url: string, _key: string, options: { cookies: any }) => {
      return {
        auth: {
          signOut: jest.fn(),
        },
        options,
      }
    })

    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('cierra sesión en Supabase y devuelve el destino de logout', async () => {
    const request = new Request('https://example.com/api/logout', { method: 'POST' })

    const response = await POST(request)

    const client = createServerClientMock.mock.results[0].value
    expect(client.auth.signOut).toHaveBeenCalledTimes(1)
    expect(jsonSpy).toHaveBeenCalledWith({ message: 'logout_ok', redirectTo: '/login' })
    expect(response).toEqual({ body: { message: 'logout_ok', redirectTo: '/login' }, init: undefined })
  })
})