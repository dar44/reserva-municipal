import { render, screen } from '@testing-library/react'

import ReservasPage from '@/app/(citizen)/reservas/page'
import { ToastProvider } from '@/components/Toast'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/components/OpenStreetMapView', () => () => <div data-testid="map" />)

const reservasMock = [
  {
    id: 1,
    start_at: '2026-04-01T10:00:00Z',
    end_at: '2026-04-01T11:00:00Z',
    price: 0,
    status: 'activa',
    paid: true,
    recintos: { name: 'Gimnasio central', ubication: 'Av. Siempre Viva 123' }
  },
  {
    id: 2,
    start_at: '2026-03-10T08:00:00Z',
    end_at: '2026-03-10T09:00:00Z',
    price: 5000,
    status: 'cancelada',
    paid: false,
    recintos: { name: 'Cancha techada', ubication: null }
  }
]

function createReservasQuery (data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve({ data }).then(resolve)
  }
  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerReadOnly: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: jest.fn((table: string) => {
      if (table !== 'reservas') throw new Error('Unexpected table ' + table)
      return createReservasQuery(reservasMock)
    })
  }))
}))

describe('ReservasPage (ciudadanía)', () => {
  it('muestra el listado con estados y acciones', async () => {
    const ui = await ReservasPage()

    render(<ToastProvider>{ui}</ToastProvider>)

    expect(screen.getByRole('heading', { name: /tus reservas/i })).toBeInTheDocument()
    expect(screen.getByText('Gimnasio central')).toBeInTheDocument()
    expect(screen.getByText('Cancha techada')).toBeInTheDocument()

    expect(screen.getAllByText(/ver detalle/i)).toHaveLength(2)
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    expect(screen.getByText('cancelada')).toBeInTheDocument()

    expect(screen.getByTestId('map')).toBeInTheDocument()
  })
})