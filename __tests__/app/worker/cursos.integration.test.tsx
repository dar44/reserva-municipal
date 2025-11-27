import { render, screen } from '@testing-library/react'
import WorkerCursosPage from '@/app/worker/cursos/page'

jest.mock('next/image', () => (props: any) => <img {...props} alt={props.alt} />)

const sampleCursos = [
  {
    id: 10,
    image: 'curso.png',
    image_bucket: 'cursos',
    name: 'Natación',
    description: 'Piscina temperada',
    begining_date: '2026-08-10',
    capacity: 20,
    state: 'Disponible',
    inscripciones: [{ count: 12 }]
  },
  {
    id: 11,
    image: null,
    image_bucket: null,
    name: 'Tenis',
    description: 'Cancha municipal',
    begining_date: '2026-09-01',
    capacity: 16,
    state: 'Cerrado',
    inscripciones: [{ count: 0 }]
  }
]

function createCursosQuery (data: any[]) {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnValue(Promise.resolve({ data })),
    then: (resolve: any) => Promise.resolve({ data }).then(resolve)
  }
  return builder
}

jest.mock('@/lib/supabaseServer', () => ({
  createSupabaseServer: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table !== 'cursos') throw new Error('Unexpected table ' + table)
      return createCursosQuery(sampleCursos)
    })
  }))
}))

jest.mock('@/lib/storage', () => ({
  getPublicStorageUrl: jest.fn((_, path: string | null) => path ? `https://example.com/${path}` : null)
}))

describe('WorkerCursosPage', () => {
  it('muestra la tabla de cursos con imágenes o iniciales y acciones', async () => {
    const ui = await WorkerCursosPage()
    render(ui)

    expect(screen.getByRole('heading', { name: /gestión de cursos/i })).toBeInTheDocument()

    expect(screen.getByAltText('Natación')).toHaveAttribute('src', expect.stringContaining('curso.png'))
    expect(screen.getByText('T')).toBeInTheDocument()

    expect(screen.getByText('Natación')).toBeInTheDocument()
    expect(screen.getByText('Piscina temperada')).toBeInTheDocument()
    expect(screen.getByText('12/20')).toBeInTheDocument()

    expect(screen.getByText('Tenis')).toBeInTheDocument()
    expect(screen.getByText('0/16')).toBeInTheDocument()

    expect(screen.getAllByText(/acciones/i).length).toBeGreaterThan(0)
  })
})