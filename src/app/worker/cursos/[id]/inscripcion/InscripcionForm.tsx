'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Loader2, HelpCircle } from 'lucide-react'

export default function InscripcionForm({ cursoId }: { cursoId: number }) {
  const [isNew, setIsNew] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      curso_id: cursoId,
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

    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.checkoutUrl) {
      toast({ type: 'success', message: 'Pago iniciado. Se abrirá el checkout.' })
      window.open(data.checkoutUrl as string, '_blank', 'noopener')
    } else if (!res.ok) {
      toast({ type: 'error', message: data.error || 'Error al crear la inscripción' })
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">¿El participante tiene cuenta en el sistema?</p>
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
              <Tooltip content="Formato:12345678A (8 dígitos + letra)">
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

      <Button className="w-full bg-success hover:bg-success/90" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          'Confirmar Inscripción'
        )}
      </Button>
    </form>
  )
}