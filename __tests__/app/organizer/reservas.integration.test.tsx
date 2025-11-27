import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrganizerReservationsClient from '@/app/organizer/reservas/OrganizerReservationsClient'
import { ToastProvider } from '@/components/Toast'

describe('OrganizerReservationsClient', () => {
  const baseProps = {
    courses: [
      { id: 10, name: 'Curso de verano' }
    ],
    recintos: [
      { id: 5, name: 'Sala multiuso', state: 'Disponible' },
      { id: 6, name: 'Gimnasio', state: 'En mantenimiento' }
    ],
    reservations: [
      {
        id: 1,
        curso_id: 10,
        recinto_id: 5,
        start_at: '2026-02-01T10:00:00Z',
        end_at: '2026-02-01T12:00:00Z',
        status: 'aprobada' as const,
        observations: 'Traer llaves'
      },
      {
        id: 2,
        curso_id: 10,
        recinto_id: 5,
        start_at: '2026-01-15T09:00:00Z',
        end_at: '2026-01-15T10:00:00Z',
        status: 'pendiente' as const,
        observations: null
      }
    ]
  }

  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch as any
  })

  it('muestra recintos disponibles e historial ordenado', () => {
    render(
      <ToastProvider>
        <OrganizerReservationsClient {...baseProps} />
      </ToastProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Sala multiuso' })
    ).toBeInTheDocument()

    expect(screen.queryByText('Gimnasio')).toBeNull()

    const statuses = screen.getAllByText(/aprobada|pendiente/i)
    expect(statuses).toHaveLength(2)

    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('valida campos obligatorios antes de enviar', async () => {
    const user = userEvent.setup()

    const fetchMock = jest.fn()
    global.fetch = fetchMock as any

    render(
      <ToastProvider>
        <OrganizerReservationsClient {...baseProps} />
      </ToastProvider>
    )

    await user.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  it('envía la solicitud y agrega bloques nuevos', async () => {
    const user = userEvent.setup()

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          reservas: [
            {
              id: 99,
              curso_id: 10,
              recinto_id: 5,
              start_at: '2026-03-01T08:00:00Z',
              end_at: '2026-03-01T09:00:00Z',
              status: 'pendiente',
              observations: null
            }
          ]
        })
    } as any)

    global.fetch = fetchMock as any

    render(
      <ToastProvider>
        <OrganizerReservationsClient {...baseProps} />
      </ToastProvider>
    )

    await user.selectOptions(screen.getByLabelText('Curso'), '10')
    await user.selectOptions(screen.getByLabelText('Recinto'), '5')
    await user.type(screen.getByLabelText('Fecha de inicio'), '2026-03-01')
    await user.type(screen.getByLabelText('Fecha de término'), '2026-03-02')
    await user.type(screen.getByLabelText('Hora de inicio'), '08:00')
    await user.type(screen.getByLabelText('Hora de término'), '09:00')
    await user.click(screen.getByLabelText('Lunes'))

    await user.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/organizer/reservas',
        expect.any(Object)
      )
      expect(
        screen.getByText(/se generó 1 bloque/i)
      ).toBeInTheDocument()
    })

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4)
  })
})
