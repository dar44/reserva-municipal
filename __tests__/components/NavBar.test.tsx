import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/reservas'),
  useRouter: jest.fn(() => ({ push: pushMock })),
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
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      <button onClick={() => { onClose() }}>Ver perfil</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}))

describe('NavBar', () => {
  beforeEach(() => {
    pushMock.mockClear()
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
    expect(reservasLink.className).toContain('bg-primary')

    expect(selectMock).toHaveBeenCalledWith('name')
    expect(eqMock).toHaveBeenCalledWith('uid', 'uid-1')
  })

  it('abre el menú y hace click en Ver perfil', async () => {
    const { NavBar } = await import('@/components/NavBar')
    const user = userEvent.setup()

    render(<NavBar />)

    // Esperar a que cargue el nombre
    await screen.findByRole('button', { name: /Ada/ })

    // Abrir el dropdown de usuario
    await user.click(screen.getByRole('button', { name: /Ada/ }))

    // Hacer click en "Ver perfil"
    await user.click(screen.getByText('Ver perfil'))

    // El menú debería cerrarse tras hacer click
    await waitFor(() => expect(screen.queryByText('Cerrar')).not.toBeInTheDocument())
  })
})