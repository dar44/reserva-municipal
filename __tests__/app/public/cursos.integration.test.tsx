import { render, screen, act } from '@testing-library/react'

import PublicCursosPage from '@/app/public/cursos/page'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} />
}))

function createCursosQuery(data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve)
  }

  return builder
}

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn((table: string) => {
      if (table !== 'cursos') throw new Error('Unexpected table ' + table)
      return createCursosQuery([])
    })
  }
}))

jest.mock('@/lib/storage', () => ({
  getPublicStorageUrl: jest.fn(() => 'https://storage.example.com/image.png')
}))

describe('PublicCursosPage', () => {
  it('mantiene la ruta publica al limpiar filtros desde el empty state', async () => {
    const ui = await PublicCursosPage({ searchParams: Promise.resolve({ search: 'Yoga' }) })

    await act(async () => {
      render(ui)
    })

    expect(await screen.findByText(/no se encontraron cursos/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /limpiar filtros/i })).toHaveAttribute('href', '/public/cursos')
  })
})
