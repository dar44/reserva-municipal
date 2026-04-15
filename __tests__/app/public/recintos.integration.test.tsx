import { render, screen } from '@testing-library/react'

import PublicRecintosPage from '@/app/public/recintos/page'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} />
}))

function createRecintosQuery(data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve({ data }).then(resolve)
  }

  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerAdmin: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table !== 'recintos') throw new Error('Unexpected table ' + table)
      return createRecintosQuery([])
    })
  })),
  createSupabaseServerReadOnly: jest.fn()
}))

jest.mock('@/lib/recintoImages', () => ({
  getRecintoDefaultPublicUrl: jest.fn(() => 'https://storage.example.com/default.png'),
  getRecintoImageUrl: jest.fn(() => 'https://storage.example.com/image.png')
}))

describe('PublicRecintosPage', () => {
  it('mantiene la ruta publica al limpiar filtros desde el empty state', async () => {
    const ui = await PublicRecintosPage({ searchParams: Promise.resolve({ search: 'Piscina' }) })

    render(ui)

    expect(screen.getByText(/no se encontraron recintos/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /limpiar filtros/i })).toHaveAttribute('href', '/public/recintos')
  })
})
