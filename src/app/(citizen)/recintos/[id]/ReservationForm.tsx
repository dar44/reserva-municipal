'use client'

import { FormEvent, useState } from 'react'
import { useToast } from '@/components/Toast'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface ReservationFormProps {
  recintoId: number
  slots: string[]
  priceLabel: string
}

export default function ReservationForm({ recintoId, slots, priceLabel }: ReservationFormProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fecha mínima: hoy (no se permiten fechas pasadas)
  const today = new Date().toISOString().split('T')[0]

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
      <label className="block text-sm">
        <span className="flex items-center gap-2 mb-1">
          Fecha de reserva
          <Tooltip content="Solo se admiten fechas futuras. Las fechas anteriores a hoy están bloqueadas.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </span>
        <input
          type="date"
          name="date"
          className="input-base block w-full mt-1"
          min={today}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="flex items-center gap-2 mb-1">
          Hora inicio – fin
          <Tooltip content="Cada bloque tiene una duración de 1 hora. Si el horario ya está reservado, el sistema lo notificará al intentar confirmar.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </span>
        <select name="slot" className="input-base block w-full mt-1">
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </label>
      <Button
        className="w-full hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Procesando...' : `Confirmar reserva – ${priceLabel}`}
      </Button>
      <p className="text-xs text-tertiary text-center">
        Serás redirigido al checkout seguro de Lemon Squeezy para completar el pago.
      </p>
    </form>
  )
}