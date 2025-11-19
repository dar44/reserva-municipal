import { AuthorizationError, assertRole, getSessionProfile, isRole } from '@/lib/auth/roles'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const redirectMock = jest.requireMock('next/navigation').redirect as jest.Mock

type SupabaseUser = { id: string } | null

type SupabaseUserResponse = {
  data: { user: SupabaseUser }
}

type SupabaseQueryResponse = {
  data: { uid: string; role: string } | null
  error: { message: string } | null
}

type SupabaseMock = {
  auth: { getUser: jest.Mock<Promise<SupabaseUserResponse>> }
  from: jest.Mock
}

function createSupabaseMock (
  user: SupabaseUser,
  queryResponse: SupabaseQueryResponse,
): SupabaseMock {
  const maybeSingleMock = jest.fn().mockResolvedValue(queryResponse)
  const eqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    from: jest.fn().mockReturnValue({ select: selectMock }),
  }
}

describe('auth roles helpers', () => {
  beforeEach(() => {
    redirectMock.mockReset()
    redirectMock.mockImplementation(() => { throw new Error('REDIRECT') })
  })

  it('redirige a /login cuando no hay sesión en getSessionProfile', async () => {
    const supabase = createSupabaseMock(null, { data: null, error: null })

    await expect(getSessionProfile(supabase as any)).rejects.toThrow('REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('lanza AuthorizationError cuando el perfil no está en la tabla users', async () => {
    const supabase = createSupabaseMock({ id: 'uid-001' }, { data: null, error: { message: 'not found' } })

    await expect(getSessionProfile(supabase as any)).rejects.toThrow(AuthorizationError)
    expect(supabase.from).toHaveBeenCalledWith('users')
  })

  it('devuelve el perfil con rol cuando Supabase responde OK', async () => {
    const supabase = createSupabaseMock(
      { id: 'uid-999' },
      { data: { uid: 'uid-999', role: 'worker' }, error: null },
    )

    const profile = await getSessionProfile(supabase as any)

    expect(profile).toEqual({ uid: 'uid-999', role: 'worker' })
  })

  it('assertRole permite roles autorizados y rechaza el resto', () => {
    const profile = { uid: 'u1', role: 'worker' as const }

    expect(() => assertRole(profile, ['admin', 'worker'])).not.toThrow()
    expect(() => assertRole(profile, ['admin'])).toThrow(AuthorizationError)
  })

  it('isRole comprueba membership múltiple correctamente', () => {
    const profile = { uid: 'u2', role: 'organizer' as const }

    expect(isRole(profile, 'admin', 'organizer')).toBe(true)
    expect(isRole(profile, 'admin', 'worker')).toBe(false)
  })
})