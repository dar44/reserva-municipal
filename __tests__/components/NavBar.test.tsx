import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/reservas'),
}))

const getUserMock = jest.fn()
const singleMock = jest.fn()
const eqMock = jest.fn(() => ({ single: singleMock }))
const selectMock = jest.fn(() => ({ eq: eqMock }))

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: { getUser: getUserMock },
    from: () => ({ select: selectMock }),
  },
}))

jest.mock('@/components/ProfileDropdown', () => ({
  __esModule: true,
  default: ({ onViewProfile, onClose }: { onViewProfile: () => void; onClose: () => void }) => (
    <div>
      <button onClick={onViewProfile}>Ver perfil</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}))

const onUpdatedHandlers: Array<(value: string) => void> = []

jest.mock('@/components/ProfileModal', () => ({
  __esModule: true,
  default: ({ onUpdated }: { onUpdated: (value: string) => void }) => {
    onUpdatedHandlers.push(onUpdated)
    return <div>ProfileModalMock</div>
  },
}))

describe('NavBar', () => {
  beforeEach(() => {
    onUpdatedHandlers.length = 0
    selectMock.mockClear()
    eqMock.mockClear()
    singleMock.mockClear()
    getUserMock.mockClear()
    getUserMock.mockResolvedValue({ data: { user: { id: 'uid-1' } } })
    singleMock.mockResolvedValue({ data: { name: 'Ada' } })
  })

  it('muestra el nombre y marca activa la ruta actual', async () => {
    const { NavBar } = await import('@/components/NavBar')

    render(<NavBar />)

    await waitFor(() => expect(screen.getByRole('button', { name: /Ada/ })).toBeInTheDocument())

    const reservasLink = screen.getByRole('link', { name: 'Reservas' })
    expect(reservasLink.className).toContain('bg-blue-600')

    expect(selectMock).toHaveBeenCalledWith('name')
    expect(eqMock).toHaveBeenCalledWith('uid', 'uid-1')
  })

  it('abre el menú y el modal de perfil', async () => {
    const { NavBar } = await import('@/components/NavBar')
    const user = userEvent.setup()

    render(<NavBar />)

    await user.click(await screen.findByRole('button', { name: /Ada/ }))
    await user.click(screen.getByText('Ver perfil'))

    expect(screen.getByText('ProfileModalMock')).toBeInTheDocument()

    await act(async () => {
      onUpdatedHandlers.forEach(handler => handler('Grace'))
    })

    await waitFor(() => expect(screen.getByRole('button', { name: /Grace/ })).toBeInTheDocument())
  })
})