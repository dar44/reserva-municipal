import { render, screen } from '@testing-library/react'
import { SubmitButton } from '@/components/SubmitButton'

// Mock useFormStatus properly
let mockPending = false
jest.mock('react-dom', () => {
    const actual = jest.requireActual('react-dom')
    return {
        ...actual,
        useFormStatus: jest.fn(() => ({
            pending: mockPending,
            data: null,
            method: null,
            action: null
        }))
    }
})

// Import after mocking
const { useFormStatus } = require('react-dom')

describe('SubmitButton', () => {
    beforeEach(() => {
        mockPending = false
            ; (useFormStatus as jest.Mock).mockReturnValue({
                pending: mockPending,
                data: null,
                method: null,
                action: null
            })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renderiza correctamente con texto por defecto', () => {
        render(<SubmitButton>Guardar</SubmitButton>)

        const button = screen.getByRole('button', { name: /guardar/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('type', 'submit')
    })

    it('muestra spinner y texto de loading cuando pending es true', () => {
        mockPending = true
            ; (useFormStatus as jest.Mock).mockReturnValue({
                pending: true,
                data: null,
                method: null,
                action: null
            })

        render(<SubmitButton loadingText="Creando...">Crear</SubmitButton>)

        expect(screen.getByText(/creando\.\.\./i)).toBeInTheDocument()
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    it('está deshabilitado cuando pending es true', () => {
        mockPending = true
            ; (useFormStatus as jest.Mock).mockReturnValue({
                pending: true,
                data: null,
                method: null,
                action: null
            })

        render(<SubmitButton>Guardar</SubmitButton>)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    it('no está deshabilitado cuando pending es false', () => {
        render(<SubmitButton>Guardar</SubmitButton>)

        const button = screen.getByRole('button')
        expect(button).not.toBeDisabled()
    })

    it('usa texto de loading personalizado', () => {
        mockPending = true
            ; (useFormStatus as jest.Mock).mockReturnValue({
                pending: true,
                data: null,
                method: null,
                action: null
            })

        render(<SubmitButton loadingText="Procesando...">Enviar</SubmitButton>)

        expect(screen.getByText(/procesando\.\.\./i)).toBeInTheDocument()
        expect(screen.queryByText(/enviar/i)).not.toBeInTheDocument()
    })

    it('acepta props adicionales del Button component', () => {
        render(
            <SubmitButton
                variant="outline"
                className="custom-class"
                data-testid="submit-btn"
            >
                Guardar
            </SubmitButton>
        )

        const button = screen.getByTestId('submit-btn')
        expect(button).toHaveClass('custom-class')
    })

    it('mantiene el tipo submit', () => {
        render(<SubmitButton>Guardar</SubmitButton>)

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('type', 'submit')
    })
})
