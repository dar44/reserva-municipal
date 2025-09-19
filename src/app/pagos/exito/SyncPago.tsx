'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  pagoId?: string
}

type EstadoPago = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'cancelado' | 'desconocido'

export default function SyncPago ({ pagoId }: Props) {
  const [estado, setEstado] = useState<EstadoPago>('pendiente')
  const intentosRef = useRef(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pagoId) return

    let abort = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    intentosRef.current = 0

    const sync = async () => {
      try {
        const res = await fetch(`/api/pagos/${pagoId}/sync`, { method: 'POST' })
        const data = await res.json().catch(() => ({})) as { estado?: string; error?: string }

        if (abort) return

        if (!res.ok) {
          setError(data?.error ?? 'No se pudo confirmar el estado del pago')
          return
        }

        const nuevoEstado = (data?.estado as EstadoPago | undefined) ?? 'desconocido'
        setEstado(nuevoEstado)
        intentosRef.current += 1

        if (nuevoEstado !== 'pagado' && intentosRef.current < 5) {
          timeout = setTimeout(sync, 4000)
        }
      } catch (e) {
        if (abort) return
        const message = e instanceof Error ? e.message : 'No se pudo confirmar el estado del pago'
        setError(message)
      }
    }

    sync()

    return () => {
      abort = true
      if (timeout) clearTimeout(timeout)
    }
  }, [pagoId])

  if (!pagoId) return null

  if (error) {
    return (
      <p className="text-sm text-red-400">
        {error}. Actualiza esta página más tarde para comprobar si se registró el pago.
      </p>
    )
  }

  if (estado === 'pagado') {
    return <p className="text-sm text-green-400">Pago confirmado correctamente.</p>
  }

  if (estado === 'pendiente') {
    return <p className="text-sm text-gray-400">Confirmando el pago con la pasarela...</p>
  }

  if (estado === 'desconocido') {
    return (
      <p className="text-sm text-yellow-400">
        No se pudo determinar el estado final del pago todavía. Intentaremos nuevamente en unos segundos.
      </p>
    )
  }

  return (
    <p className="text-sm text-yellow-400">
      El pago se encuentra en estado: {estado}. Revísalo en el panel administrativo para más detalles.
    </p>
  )
}