import { render, screen } from '@testing-library/react'
import AdminReservasPage from '@/app/admin/reservas/page'

const sampleReservas = [
  {
    id: 1,
    start_at: '2026-10-01T18:00:00Z',
    status: 'confirmada',
    users: { email: 'ana@example.com' },
    recintos: { name: 'Biblioteca' },
  },
]

const sampleUsuarios = [
  { uid: 'u1', name: 'Ana' },
  { uid: 'u2', name: 'Luis' },
]

const sampleRecintos = [
  { id: 3, name: 'Biblioteca' },
  { id: 4, name: 'Piscina' },
]

function createQuery (data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnValue(Promise.resolve({ data })),
  }
  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(() => {
    const reservasQuery = createQuery(sampleReservas)
    const usuariosQuery = createQuery(sampleUsuarios)
    const recintosQuery = createQuery(sampleRecintos)

    return {
      from: jest.fn((table: string) => {
        if (table === 'reservas') return reservasQuery
        if (table === 'users') return usuariosQuery
        if (table === 'recintos') return recintosQuery
        throw new Error('Unexpected table ' + table)
      }),
    }
  }),
}))

describe('AdminReservasPage', () => {
  it('muestra filtros con valores iniciales y renderiza la tabla', async () => {
    const searchParams = Promise.resolve({
      user: 'u1',
      recinto: '3',
      from: '2026-09-01',
      to: '2026-10-30',
    })

    const ui = await AdminReservasPage({ searchParams })
    render(ui)

    expect(
      screen.getByRole('heading', { name: /reservas/i })
    ).toBeInTheDocument()

    const [userSelect, recintoSelect] = screen.getAllByRole('combobox')
    expect(userSelect).toBeInTheDocument()
    expect(recintoSelect).toBeInTheDocument()
    expect(userSelect).toHaveDisplayValue('Usuario')
    expect(recintoSelect).toHaveDisplayValue('Recinto')

    // Filtros 
    expect(
      (screen.getByDisplayValue('2026-09-01') as HTMLInputElement).name
    ).toBe('from')
    expect(
      (screen.getByDisplayValue('2026-10-30') as HTMLInputElement).name
    ).toBe('to')

    // Tabla con las reservas
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('Biblioteca')).toBeInTheDocument()
    expect(screen.getByText(/confirmada/i)).toBeInTheDocument()
  })
})
