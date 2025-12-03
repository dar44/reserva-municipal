import { render, screen } from '@testing-library/react'

import CursosPage from '@/app/(citizen)/cursos/page'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} />
}))

const sampleCourses = [
  {
    id: 1,
    name: 'Taller de pintura',
    description: 'Aprende acuarela',
    price: 12000,
    begining_date: '2026-05-01',
    end_date: '2026-06-01',
    image: 'painting.png',
    image_bucket: 'cursos',
    state: 'Disponible'
  },
  {
    id: 2,
    name: 'Yoga en plaza',
    description: 'Clases al aire libre',
    price: 0,
    begining_date: '2026-07-01',
    end_date: '2026-07-30',
    image: null,
    image_bucket: null,
    state: 'Disponible'
  }
]

function createCursosQuery(data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve({ data }).then(resolve)
  }
  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerReadOnly: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table !== 'cursos') throw new Error('Unexpected table ' + table)
      return createCursosQuery(sampleCourses)
    })
  }))
}))

jest.mock('@/lib/storage', () => ({
  getPublicStorageUrl: jest.fn(() => 'https://storage.example.com/image.png')
}))

describe('CursosPage (ciudadanía)', () => {
  it('lista los cursos disponibles y mantiene los filtros', async () => {
    const ui = await CursosPage({ searchParams: Promise.resolve({ from: '2026-01-01', to: '2026-12-31' }) })

    render(ui)

    expect(screen.getByRole('heading', { name: /cursos disponibles/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-01-01')).toHaveAttribute('name', 'from')
    expect(screen.getByDisplayValue('2026-12-31')).toHaveAttribute('name', 'to')

    const cards = screen.getAllByRole('link', { name: /ver más/i })
    expect(cards).toHaveLength(sampleCourses.length)

    expect(screen.getByText('Taller de pintura')).toBeInTheDocument()
    expect(screen.getByText('Yoga en plaza')).toBeInTheDocument()
  })

  it('muestra el campo de búsqueda por nombre', async () => {
    const ui = await CursosPage({ searchParams: Promise.resolve({}) })

    render(ui)

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('name', 'search')

    expect(screen.getByRole('button', { name: /filtrar/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /limpiar/i })).toBeInTheDocument()
  })

  it('mantiene el valor de búsqueda en el input', async () => {
    const ui = await CursosPage({ searchParams: Promise.resolve({ search: 'Yoga' }) })

    render(ui)

    expect(screen.getByDisplayValue('Yoga')).toHaveAttribute('name', 'search')
  })

  it('muestra un mensaje vacío cuando no hay resultados', async () => {
    const emptyQuery = createCursosQuery([])
    const { createSupabaseServerReadOnly } = await import('@/lib/supabaseServer') as any
      ; (createSupabaseServerReadOnly as jest.Mock).mockReturnValueOnce({
        from: jest.fn(() => emptyQuery)
      })

    const ui = await CursosPage({ searchParams: Promise.resolve({}) })
    render(ui)

    expect(screen.getByText(/no se han encontrado cursos/i)).toBeInTheDocument()
  })
})