import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteReservaButton from '@/app/admin/reservas/DeleteReservaButton'

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

// Mock useRouter
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh
    })
}))

describe('DeleteReservaButton with Toastify', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
        jest.clearAllMocks()
        mockRefresh.mockClear()
    })

    afterEach(() => {
        global.fetch = originalFetch as any
    })

    it('renderiza el botón de eliminar correctamente', () => {
        render(<DeleteReservaButton id={1} tipo="Recinto" />)

        const deleteButton = screen.getByRole('button', { name: /eliminar/i })
        expect(deleteButton).toBeInTheDocument()
    })

    it('muestra modal de confirmación al hacer clic', async () => {
        const user = userEvent.setup()

        render(<DeleteReservaButton id={1} tipo="Recinto" />)

        await user.click(screen.getByRole('button', { name: /eliminar/i }))

        expect(screen.getByText(/confirmar/i)).toBeInTheDocument()
        expect(screen.getByText(/¿estás seguro de que quieres eliminar esta reserva\?/i)).toBeInTheDocument()
    })

    it('cierra el modal al hacer clic en Cancelar', async () => {
        const user = userEvent.setup()

        render(<DeleteReservaButton id={1} tipo="Recinto" />)

        await user.click(screen.getByRole('button', { name: /eliminar/i }))
        await user.click(screen.getByRole('button', { name: /cancelar/i }))

        await waitFor(() => {
            expect(screen.queryByText(/confirmar/i)).not.toBeInTheDocument()
        })
    })
})
