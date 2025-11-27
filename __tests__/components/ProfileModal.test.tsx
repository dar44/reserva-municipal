
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const getUserMock = jest.fn()
const updateUserMock = jest.fn()
const usersSelectMock = jest.fn()
const usersSelectEqMock = jest.fn()
const usersSelectSingleMock = jest.fn()
const usersUpdateMock = jest.fn()
const usersUpdateEqMock = jest.fn()

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock,
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: usersSelectEqMock })),
      update: usersUpdateMock,
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}))

jest.mock('@/components/Toast', () => ({
  useToast: () => jest.fn(),
}))

const buildStorageUrlMock = jest.fn()
const listBucketPrefixMock = jest.fn()
const isUserProfileObjectMock = jest.fn()

jest.mock('@/lib/storage', () => ({
  USER_DEFAULTS_FOLDER: 'defaults',
  USER_STORAGE_BUCKET: 'avatars',
  buildStorageUrl: (...args: any[]) => buildStorageUrlMock(...args),
  buildUserProfilePath: jest.fn((uid: string, name: string) => `${uid}/${name}`),
  isUserProfileObject: (...args: any[]) => isUserProfileObjectMock(...args),
  listBucketPrefix: (...args: any[]) => listBucketPrefixMock(...args),
}))

describe('ProfileModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: 'uid-77' } } })
    updateUserMock.mockResolvedValue({ data: {}, error: null })
    buildStorageUrlMock.mockResolvedValue('https://cdn.example/avatar.png')
    listBucketPrefixMock.mockResolvedValue([])
    isUserProfileObjectMock.mockReturnValue(false)

    usersSelectSingleMock.mockResolvedValue({
      data: {
        name: 'Ada',
        surname: 'Lovelace',
        dni: '1-9',
        phone: '+569',
        image: null,
        image_bucket: null,
      },
    })
    usersSelectEqMock.mockReturnValue({ single: usersSelectSingleMock })
    usersSelectMock.mockReturnValue({ eq: usersSelectEqMock })
    usersUpdateEqMock.mockResolvedValue({ error: null })
    usersUpdateMock.mockImplementation(() => ({ eq: usersUpdateEqMock }))

    const from = jest.requireMock('@/lib/supabaseClient').supabase.from as jest.Mock
    from.mockReturnValue({
      select: usersSelectMock,
      update: usersUpdateMock,
    })
  })

  it('carga y muestra los datos del perfil', async () => {
    const { default: ProfileModal } = await import('@/components/ProfileModal')

    render(<ProfileModal onClose={jest.fn()} onUpdated={jest.fn()} />)

    expect(await screen.findByText('Ada')).toBeInTheDocument()
    expect(usersSelectEqMock).toHaveBeenCalledWith('uid', 'uid-77')
    expect(buildStorageUrlMock).toHaveBeenCalled()
  })

  it('permite editar y guardar el nombre', async () => {
    const { default: ProfileModal } = await import('@/components/ProfileModal')
    const user = userEvent.setup()
    const onUpdated = jest.fn()

    render(<ProfileModal onClose={jest.fn()} onUpdated={onUpdated} />)

    await user.click(await screen.findByRole('button', { name: 'Modificar perfil' }))
    await user.click(screen.getAllByText('Editar')[0])

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.clear(input)
    await user.type(input, 'Grace')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(updateUserMock).toHaveBeenCalled())
    expect(updateUserMock).toHaveBeenCalledWith({ data: { name: 'Grace' } })
    expect(usersUpdateMock).toHaveBeenCalled()
    expect(usersUpdateEqMock).toHaveBeenCalledWith('uid', 'uid-77')
    expect(onUpdated).toHaveBeenCalledWith('Grace')
  })
})