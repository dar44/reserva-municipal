'use client'

import { FormEvent, useState } from 'react'
import { useToast } from '@/components/Toast'

interface ReservationFormProps {
  recintoId: number
  slots: string[]
  priceLabel: string
}

export default function ReservationForm ({ recintoId, slots, priceLabel }: ReservationFormProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('recinto_id', String(recintoId))

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data && typeof data.checkoutUrl === 'string') {
          toast({ type: 'success', message: 'Reserva iniciada. Serás redirigido al checkout.' })
          window.location.href = data.checkoutUrl
          return
        }

        toast({ type: 'success', message: 'Reserva creada correctamente.' })
        form.reset()
        return
      }

      const data = await res.json().catch(() => ({}))
      const fallbackMessage = 'No se pudo crear la reserva. Intenta nuevamente.'
      const message =
        (data && typeof data.error === 'string' && data.error) ||
        (res.status === 409
          ? 'Ese horario ya está reservado. Por favor elige otro horario.'
          : fallbackMessage)

      toast({ type: 'error', message })
    } catch {
      toast({ type: 'error', message: 'No se pudo crear la reserva. Intenta nuevamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="recinto_id" value={recintoId} />
      <label className="block text-sm">Fecha de reserva
        <input
          type="date"
          name="date"
          className="block w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1"
          required
        />
      </label>
      <label className="block text-sm">Hora inicio – fin
        <select name="slot" className="block w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1">
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </label>
      <button
        className="w-full bg-blue-600 py-2 rounded disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Procesando...' : `Confirmar reserva – ${priceLabel}`}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Serás redirigido al checkout seguro de Lemon Squeezy para completar el pago.
      </p>
    </form>
  )
}