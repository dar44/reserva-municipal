import { render, screen } from '@testing-library/react'
import WorkerReservasPage from '@/app/worker/reservas/page'

jest.mock('@/app/worker/reservas/DeleteButton', () => ({
  __esModule: true,
  default: ({ id }: { id: number }) => <button>Eliminar {id}</button>
}))

const sampleReservas = [
  {
    id: 21,
    start_at: '2026-09-05T10:00:00Z',
    end_at: '2026-09-05T12:00:00Z',
    price: 15000,
    paid: true,
    users: { email: 'vecino@example.com' },
    recintos: { name: 'Gimnasio Municipal' }
  },
  {
    id: 22,
    start_at: '2026-09-06T15:30:00Z',
    end_at: '2026-09-06T16:30:00Z',
    price: 0,
    paid: false,
    users: { email: 'maria@example.com' },
    recintos: { name: 'Cancha techada' }
  }
]

function createReservasQuery (data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnValue(Promise.resolve({ data }))
  }
  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table !== 'reservas') throw new Error('Unexpected table ' + table)
      return createReservasQuery(sampleReservas)
    })
  }))
}))

jest.mock('@/lib/config', () => ({ getConfiguredCurrency: jest.fn(() => 'CLP') }))
jest.mock('@/lib/currency', () => ({ formatCurrency: jest.fn((amount: number) => `CLP ${amount}`) }))

describe('WorkerReservasPage', () => {
  it('lista las reservas de ciudadanos con formato y botones de acción', async () => {
    const ui = await WorkerReservasPage()
    render(ui)

    expect(screen.getByRole('heading', { name: /listado de reservas de ciudadanos/i })).toBeInTheDocument()
    expect(screen.getByText('vecino@example.com')).toBeInTheDocument()
    expect(screen.getByText('Gimnasio Municipal')).toBeInTheDocument()
    expect(screen.getByText('CLP 15000')).toBeInTheDocument()
    expect(screen.getAllByText(/pagado/i)[0]).toBeInTheDocument()

    expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    expect(screen.getByText('Cancha techada')).toBeInTheDocument()
    expect(screen.getByText('CLP 0')).toBeInTheDocument()
    expect(screen.getAllByText(/pendiente/i)[0]).toBeInTheDocument()

    expect(screen.getByText('Eliminar 21')).toBeInTheDocument()
    expect(screen.getByText('Eliminar 22')).toBeInTheDocument()
  })
})