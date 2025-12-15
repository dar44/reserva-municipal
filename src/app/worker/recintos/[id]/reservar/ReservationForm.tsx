'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Loader2, HelpCircle } from 'lucide-react'

const slots = Array.from({ length: 12 }, (_, i) => {
  const start = 8 + i
  const end = start + 1
  const pad = (n: number) => n.toString().padStart(2, '0')
  return {
    value: `${pad(start)}:00`,
    label: `${pad(start)}:00-${pad(end)}:00`
  }
})

export default function ReservationForm({ recintoId }: { recintoId: number }) {
  const [isNew, setIsNew] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      recinto_id: recintoId,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      email: formData.get('email') as string,
      newUser: isNew,
      fromWorker: true,
    }
    if (isNew) {
      Object.assign(payload, {
        name: formData.get('name') as string,
        surname: formData.get('surname') as string,
        dni: formData.get('dni') as string,
        phone: formData.get('phone') as string,
      })
    }

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.checkoutUrl) {
      toast({ type: 'success', message: 'Pago iniciado. Se abrirá el checkout.' })
      window.open(data.checkoutUrl as string, '_blank', 'noopener')
    } else if (!res.ok) {
      const message = data.error || (res.status === 409
        ? 'Ese horario ya está reservado. Por favor elige otro horario.'
        : 'Error al crear la reserva')
      toast({ type: 'error', message })
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          Fecha *
          <Tooltip content="Selecciona la fecha de la reserva">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </label>
        <input
          type="date"
          name="date"
          className="input-base w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          Hora inicio – fin *
          <Tooltip content="Elige el bloque horario (1 hora de duración)">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </label>
        <select name="time" className="input-base w-full" required>
          {slots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">¿El usuario tiene cuenta en el sistema?</p>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setIsNew(false)}
            variant={!isNew ? "default" : "outline"}
            size="sm"
          >
            Usuario existente
          </Button>
          <Button
            type="button"
            onClick={() => setIsNew(true)}
            variant={isNew ? "default" : "outline"}
            size="sm"
          >
            Nuevo usuario
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            Correo electrónico *
            <Tooltip content="El sistema buscará si ya existe una cuenta con este email">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </label>
          <input
            type="email"
            name="email"
            placeholder="email@ejemplo.com"
            className="input-base w-full"
            required
          />
        </div>

        {isNew && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input type="text" name="name" placeholder="Nombre" className="input-base w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Apellido *</label>
              <input type="text" name="surname" placeholder="Apellido" className="input-base w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                DNI *
                <Tooltip content="Formato: 12345678A (8 dígitos + letra)">
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </label>
              <input type="text" name="dni" placeholder="12345678A" className="input-base w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Teléfono *
                <Tooltip content="Formato: +34 600 000 000">
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </label>
              <input type="text" name="phone" placeholder="+34 600 000 000" className="input-base w-full" required />
            </div>
          </>
        )}
      </div>

      <Button className="w-full bg-success hover:bg-success/90" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          'Confirmar Reserva'
        )}
      </Button>
    </form>
  )
}