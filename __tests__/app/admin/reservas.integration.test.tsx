import { render, screen } from '@testing-library/react'
import AdminReservasPage from '@/app/admin/reservas/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn()
  })
}))

// Mock de supabaseAdmin
jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn((table: string) => {
      if (table === 'reservas') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: [
                {
                  id: 1,
                  user_uid: 'u1',
                  start_at: '2026-10-01T18:00:00Z',
                  end_at: '2026-10-01T20:00:00Z',
                  price: 500,
                  status: 'activa',
                  paid: true,
                  users: { name: 'Ana', surname: 'García' },
                  recintos: { name: 'Biblioteca' }
                }
              ]
            }))
          }))
        }
      }
      if (table === 'inscripciones') {
        return {
          select: jest.fn(() => Promise.resolve({ data: [] }))
        }
      }
      return { select: jest.fn() }
    })
  }
}))

describe('AdminReservasPage', () => {
  it('muestra filtros de búsqueda y estado, y renderiza la tabla unificada', async () => {
    const searchParams = Promise.resolve({
      search: '',
      status: 'all'
    })

    const ui = await AdminReservasPage({ searchParams })
    render(ui)

    // Verifica el encabezado
    expect(
      screen.getByRole('heading', { name: /reservas/i })
    ).toBeInTheDocument()

    // Verifica los nuevos filtros (búsqueda y estado)
    const searchInput = screen.getByPlaceholderText(/buscar por usuario o ítem/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('name', 'search')

    const statusSelect = screen.getByRole('combobox')
    expect(statusSelect).toBeInTheDocument()
    expect(statusSelect).toHaveAttribute('name', 'status')

    // Verifica el botón de filtrar
    expect(screen.getByRole('button', { name: /filtrar/i })).toBeInTheDocument()

    // Verifica la tabla con datos
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Biblioteca')).toBeInTheDocument()
    expect(screen.getAllByText(/confirmada/i).length).toBeGreaterThan(0)
  })

  it('muestra la tabla con columnas correctas para tipo Recinto y Curso', async () => {
    const searchParams = Promise.resolve({})

    const ui = await AdminReservasPage({ searchParams })
    render(ui)

    // Verifica las columnas de la tabla
    expect(screen.getByText('Usuario')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Ítem')).toBeInTheDocument()
    expect(screen.getByText(/fecha y hora/i)).toBeInTheDocument()
    expect(screen.getByText('Horario')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })
})
