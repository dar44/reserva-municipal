import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConfirmModal from '@/components/ConfirmModal'

describe('ConfirmModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmModal open={false} message="¿Seguro?" onCancel={jest.fn()} onConfirm={jest.fn()} />
    )

    expect(container).toBeEmptyDOMElement()
  })

it('muestra título, mensaje y acciones cuando está abierto', () => {
    render(
        <ConfirmModal
            open
            title="Eliminar"
            message="¿Deseas eliminar el registro?"
            onCancel={jest.fn()}
            onConfirm={jest.fn()}
        />
    )

    expect(screen.getByText('Eliminar')).toBeInTheDocument()
    expect(screen.getByText('¿Deseas eliminar el registro?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
})

it('invoca los callbacks al hacer clic en los botones', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()
    const onConfirm = jest.fn()

    render(
        <ConfirmModal
            open
            message="Proceder"
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
})
})