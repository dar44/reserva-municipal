const redirectMock = jest.fn((destination: string) => {
  throw new Error(`redirect:${destination}`)
})

class TestResponse {
  status: number
  body: any

  constructor(body?: any, init?: { status?: number }) {
    this.body = body
    this.status = init?.status ?? 200
  }
}

if (typeof globalThis.Response === 'undefined') {
  // @ts-expect-error assigning test response polyfill
  globalThis.Response = TestResponse
}

jest.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}))

const cookiesMock = jest.fn(() => ({ get: jest.fn() }))

jest.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

const supabaseStub = { auth: {} }
const createServerClientMock: jest.Mock<any, any[]> = jest.fn(() => supabaseStub)

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: Parameters<typeof createServerClientMock>) => createServerClientMock(...args),
}))

const getSessionProfileMock = jest.fn()

jest.mock('@/lib/auth/roles', () => ({
  __esModule: true,
  AuthorizationError: class AuthorizationError extends Error {
    status: number
    constructor(message: string, status = 403) {
      super(message)
      this.status = status
    }
  },
  getSessionProfile: (...args: any[]) => getSessionProfileMock(...args),
}))

const authGetUserMock = jest.fn()
const usersMaybeSingleMock = jest.fn()
const usersEqMock = jest.fn(() => ({ maybeSingle: usersMaybeSingleMock }))
const usersSelectMock = jest.fn(() => ({ eq: usersEqMock }))
const fromMock = jest.fn(() => ({ select: usersSelectMock }))

const routeSupabaseStub = {
  auth: { getUser: authGetUserMock },
  from: fromMock,
}

const createRouteHandlerClientMock: jest.Mock<any, any[]> = jest.fn(() => routeSupabaseStub)

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: (...args: Parameters<typeof createRouteHandlerClientMock>) => createRouteHandlerClientMock(...args),
}))

describe('requireByPathRSC', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirecciona a /403 cuando un worker accede a /admin', async () => {
    const { requireByPathRSC } = await import('@/lib/auth/guard')
    getSessionProfileMock.mockResolvedValue({ uid: '1', role: 'worker' })

    await expect(requireByPathRSC('/admin')).rejects.toThrow('redirect:/403')
    expect(redirectMock).toHaveBeenCalledWith('/403')
  })

  it('redirecciona a /403 cuando un citizen accede a /worker', async () => {
    const { requireByPathRSC } = await import('@/lib/auth/guard')
    getSessionProfileMock.mockResolvedValue({ uid: '2', role: 'citizen' })

    await expect(requireByPathRSC('/worker/panel')).rejects.toThrow('redirect:/403')
    expect(redirectMock).toHaveBeenCalledWith('/403')
  })

  it('permite al admin acceder a cualquier prefijo', async () => {
    const { requireByPathRSC } = await import('@/lib/auth/guard')
    getSessionProfileMock.mockResolvedValue({ uid: '3', role: 'admin' })

    const result = await requireByPathRSC('/organizer/cursos')
    expect(result.profile.role).toBe('admin')
    expect(result.supabase).toBe(supabaseStub)
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('requireAuthAPI devuelve 403 cuando el rol no es permitido', async () => {
    const { requireAuthAPI } = await import('@/lib/auth/guard')
    authGetUserMock.mockResolvedValue({ data: { user: { id: 'uid-9' } } })
    usersMaybeSingleMock.mockResolvedValue({ data: { uid: 'uid-9', role: 'citizen' }, error: null })

    const result = await requireAuthAPI(['worker'])
    expect('error' in result).toBe(true)
    expect(result).toEqual({ error: expect.any(Response) })
    if ('error' in result) {
      expect(result.error.status).toBe(403)
    }
  })

  it('requireAuthAPI permite roles autorizados', async () => {
    const { requireAuthAPI } = await import('@/lib/auth/guard')
    authGetUserMock.mockResolvedValue({ data: { user: { id: 'uid-10' } } })
    usersMaybeSingleMock.mockResolvedValue({ data: { uid: 'uid-10', role: 'worker' }, error: null })

    const result = await requireAuthAPI(['worker', 'admin'])
    expect('error' in result).toBe(false)
    if ('error' in result) {
      throw new Error('Debería devolver resultado exitoso')
    }
    expect(result.profile.role).toBe('worker')
    expect(result.supabase).toBe(routeSupabaseStub)
  })
})