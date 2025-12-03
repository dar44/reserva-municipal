import { render, screen } from '@testing-library/react'

import RecintosPage from '@/app/(citizen)/recintos/page'

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ fill, ...props }: any) => <img {...props} />
}))

const sampleRecintos = [
    {
        id: 1,
        name: 'Polideportivo Municipal',
        description: 'Instalación deportiva completa',
        ubication: 'Calle Principal 123',
        state: 'Disponible',
        image: 'polideportivo.png',
        image_bucket: 'recintos'
    },
    {
        id: 2,
        name: 'Piscina Climatizada',
        description: 'Piscina cubierta y calefaccionada',
        ubication: 'Avenida del Deporte 456',
        state: 'No Disponible',
        image: null,
        image_bucket: null
    },
    {
        id: 3,
        name: 'Sala Multiusos Central',
        description: 'Sala amplia para eventos',
        ubication: 'Plaza Mayor s/n',
        state: 'Disponible',
        image: 'sala.png',
        image_bucket: 'recintos'
    }
]

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
    createSupabaseServerReadOnly: jest.fn(() => ({
        from: jest.fn((table: string) => {
            if (table !== 'recintos') throw new Error('Unexpected table ' + table)
            return createRecintosQuery(sampleRecintos)
        }),
        storage: {
            from: jest.fn(() => ({
                getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://storage.example.com/image.png' } }))
            }))
        }
    }))
}))

jest.mock('@/lib/recintoImages', () => ({
    getRecintoDefaultPublicUrl: jest.fn(() => 'https://storage.example.com/default.png'),
    getRecintoImageUrl: jest.fn((supabase, image, bucket, defaultUrl) =>
        image ? 'https://storage.example.com/image.png' : defaultUrl
    )
}))

describe('RecintosPage (ciudadanía)', () => {
    it('lista los recintos disponibles', async () => {
        const ui = await RecintosPage({ searchParams: Promise.resolve({}) })

        render(ui)

        expect(screen.getByRole('heading', { name: /recintos disponibles/i })).toBeInTheDocument()

        const cards = screen.getAllByRole('link', { name: /ver más/i })
        expect(cards).toHaveLength(sampleRecintos.length)

        expect(screen.getByText('Polideportivo Municipal')).toBeInTheDocument()
        expect(screen.getByText('Piscina Climatizada')).toBeInTheDocument()
        expect(screen.getByText('Sala Multiusos Central')).toBeInTheDocument()
    })

    it('muestra el campo de búsqueda', async () => {
        const ui = await RecintosPage({ searchParams: Promise.resolve({}) })

        render(ui)

        const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
        expect(searchInput).toBeInTheDocument()
        expect(searchInput).toHaveAttribute('name', 'search')

        expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /limpiar/i })).toBeInTheDocument()
    })

    it('mantiene el valor de búsqueda en el input', async () => {
        const ui = await RecintosPage({ searchParams: Promise.resolve({ search: 'Piscina' }) })

        render(ui)

        expect(screen.getByDisplayValue('Piscina')).toHaveAttribute('name', 'search')
    })

    it('muestra un mensaje vacío cuando no hay resultados', async () => {
        const emptyQuery = createRecintosQuery([])
        const { createSupabaseServerReadOnly } = await import('@/lib/supabaseServer') as any
            ; (createSupabaseServerReadOnly as jest.Mock).mockReturnValueOnce({
                from: jest.fn(() => emptyQuery),
                storage: {
                    from: jest.fn(() => ({
                        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://storage.example.com/image.png' } }))
                    }))
                }
            })

        const ui = await RecintosPage({ searchParams: Promise.resolve({}) })
        render(ui)

        expect(screen.getByText(/no se han encontrado recintos/i)).toBeInTheDocument()
    })
})
