/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('@/lib/auth/guard', () => ({
  requireAuthAPI: jest.fn(),
}))

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: { admin: { listUsers: jest.fn(), updateUserById: jest.fn() } },
    from: jest.fn(),
  },
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

const jsonSpy = NextResponse.json as jest.Mock
const requireAuthAPIMock = jest.requireMock('@/lib/auth/guard').requireAuthAPI as jest.Mock
const supabaseAdmin = jest.requireMock('@/lib/supabaseAdmin').supabaseAdmin as {
  auth: { admin: { listUsers: jest.Mock, updateUserById: jest.Mock } }
  from: jest.Mock
}

import { POST } from '@/app/api/promote-admin/route'

describe('POST /api/promote-admin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jsonSpy.mockReset()
    requireAuthAPIMock.mockReset()
    requireAuthAPIMock.mockImplementation(async () => ({ supabase: {}, profile: { role: 'admin' } }))
    jsonSpy.mockImplementation((body: unknown, init?: { status?: number }) => ({ body, init }))
  })

  it('devuelve 403 si la autenticación falla', async () => {
    const forbidden = { body: { error: 'forbidden' }, init: { status: 403 } }
    jsonSpy.mockReturnValueOnce(forbidden)
    requireAuthAPIMock.mockResolvedValueOnce({ error: forbidden })

    const request = new Request('https://example.com/api/promote-admin', { method: 'POST', body: '{}' })
    const response = await POST(request)

    expect(response).toEqual(forbidden)
    expect(supabaseAdmin.auth.admin.listUsers).not.toHaveBeenCalled()
  })

  it('responde 404 si el usuario no existe', async () => {
    supabaseAdmin.auth.admin.listUsers.mockResolvedValue({ data: { users: [] }, error: null })

    const usersSelectMock = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn() }) })
    supabaseAdmin.from.mockReturnValue({ select: usersSelectMock })

    const request = new Request('https://example.com/api/promote-admin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'missing@example.com' }),
    })

    const response = await POST(request)

    expect(supabaseAdmin.auth.admin.listUsers).toHaveBeenCalledTimes(1)
    expect(jsonSpy).toHaveBeenCalledWith({ message: 'user_not_found' }, { status: 404 })
    expect(response).toEqual({ body: { message: 'user_not_found' }, init: { status: 404 } })
    expect(usersSelectMock).not.toHaveBeenCalled()
  })

  it('promociona a admin cuando se encuentra el usuario y todas las operaciones tienen éxito', async () => {
    requireAuthAPIMock.mockImplementation(async () => ({ supabase: {}, profile: { role: 'admin', uid: 'admin-1' } }))

    supabaseAdmin.auth.admin.listUsers.mockResolvedValue({
      data: { users: [{ email: 'user@example.com', id: 'auth-1' }] },
      error: null,
    })

    const singleMock = jest.fn().mockResolvedValue({ data: { id: 7 }, error: null })
    const usersEqMock = jest.fn().mockReturnValue({ single: singleMock })
    const usersSelectMock = jest.fn().mockReturnValue({ eq: usersEqMock })
    const updateEqMock = jest.fn().mockResolvedValue({ error: null })

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: usersSelectMock,
          update: jest.fn().mockReturnValue({ eq: updateEqMock }),
        }
      }
      return {}
    })

    supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({ error: null })

    const request = new Request('https://example.com/api/promote-admin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)

    expect(singleMock).toHaveBeenCalledTimes(1)
    expect(usersSelectMock).toHaveBeenCalledWith('id')
    expect(usersEqMock).toHaveBeenCalledWith('email', 'user@example.com')
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('auth-1', {
      app_metadata: { role: 'admin', user_id: 7 },
    })
    expect(updateEqMock).toHaveBeenCalledWith('id', 7)
    expect(jsonSpy).toHaveBeenCalledWith({ message: 'promoted_to_admin' })
    expect(response).toEqual({ body: { message: 'promoted_to_admin' }, init: undefined })
  })
})