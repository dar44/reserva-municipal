import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToastProvider, useToast } from '@/components/Toast'

describe('ToastProvider', () => {
  function Wrapper () {
    const show = useToast()
    return (
      <button onClick={() => show({ message: 'Hola', type: 'success' })}>
        Lanzar toast
      </button>
    )
  }

  it.each([
    ['success', 'bg-green-600'],
    ['error', 'bg-red-600'],
    ['info', 'bg-blue-600']
  ] as const)('muestra un toast %s con el estilo correcto', async (type, className) => {
    function TestConsumer () {
      const show = useToast()
      return (
        <button onClick={() => show({ message: `Toast ${type}`, type })}>
          Mostrar {type}
        </button>
      )
    }

    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )

    await user.click(screen.getByRole('button', { name: new RegExp(type, 'i') }))

    const toast = await screen.findByText(`Toast ${type}`)
    expect(toast).toHaveClass(className)
  })

  it('elimina los toasts automáticamente después de 3 segundos', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(
      <ToastProvider>
        <Wrapper />
      </ToastProvider>
    )

    await waitFor(() => {
      expect(document.querySelector('[data-toast-portal="true"]')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Lanzar toast' }))

    expect(await screen.findByText('Hola')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(2999)
    })
    expect(screen.getByText('Hola')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1)
    })

    await waitFor(() => {
      expect(screen.queryByText('Hola')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('limpia el portal al desmontar el proveedor', () => {
    const { unmount } = render(
      <ToastProvider>
        <Wrapper />
      </ToastProvider>
    )

    expect(document.querySelector('[data-toast-portal="true"]')).toBeInTheDocument()

    act(() => {
      unmount()
    })

    expect(document.querySelector('[data-toast-portal="true"]')).toBeNull()
  })
})