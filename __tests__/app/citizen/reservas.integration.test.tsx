import { render, screen } from '@testing-library/react'

import ReservasPage from '@/app/(citizen)/reservas/page'
import { ToastProvider } from '@/components/Toast'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

jest.mock('@/components/OpenStreetMapView', () => () => <div data-testid="map" />)

const reservasMock = [
  {
    id: 1,
    start_at: '2026-04-01T10:00:00Z',
    end_at: '2026-04-01T11:00:00Z',
    price: 5000,
    status: 'activa',
    paid: true,
    recintos: { name: 'Gimnasio central', ubication: 'Av. Siempre Viva 123' }
  },
  {
    id: 2,
    start_at: '2020-03-10T08:00:00Z',
    end_at: '2020-03-10T09:00:00Z',
    price: 3000,
    status: 'cancelada',
    paid: false,
    recintos: { name: 'Cancha techada', ubication: null }
  }
]

const inscripcionesMock = [
  {
    id: 10,
    status: 'activa',
    paid: false,
    cursos: {
      name: 'Yoga para principiantes',
      begining_date: '2026-05-01',
      end_date: '2026-06-01',
      price: 8000
    }
  }
]

function createQuery(data: any[]) {
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
      if (table === 'reservas') return createQuery(reservasMock)
      if (table === 'inscripciones') return createQuery(inscripcionesMock)
      throw new Error('Unexpected table ' + table)
    })
  }))
}))

describe('ReservasPage (ciudadanía)', () => {
  it('muestra el listado con estados y acciones', async () => {
    const ui = await ReservasPage({ searchParams: Promise.resolve({}) })

    render(<ToastProvider>{ui}</ToastProvider>)

    expect(screen.getByRole('heading', { name: /mis reservas/i })).toBeInTheDocument()

    // Check stats cards
    expect(screen.getByText('Total de reservas')).toBeInTheDocument()
    expect(screen.getAllByText('Reservas activas').length).toBeGreaterThan(0) // Appears in both stat card and section heading
    expect(screen.getByText('Total invertido')).toBeInTheDocument()

    // Check that both recintos and cursos appear
    expect(screen.getByText('Gimnasio central')).toBeInTheDocument()
    expect(screen.getByText('Yoga para principiantes')).toBeInTheDocument()

    // Check status badges
    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente')).toHaveLength(1) // Only one pending item now

    // Check delete button only appears for unpaid items
    expect(screen.getAllByRole('button', { name: /eliminar/i })).toHaveLength(1) // Only for pending items

    // Check history section
    expect(screen.getByText('Historial')).toBeInTheDocument()
    expect(screen.getByText('Cancha techada')).toBeInTheDocument() // Canceled item in history
  })
})