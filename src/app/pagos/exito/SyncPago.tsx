'use client'
import { useEffect, useRef, useState } from 'react'

const RETRY_DELAY_MS = 4000
const MAX_INTENTOS = 10

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
        intentosRef.current += 1
      try {
        const res = await fetch(`/api/pagos/${encodeURIComponent(pagoId)}`, {
          cache: 'no-store'
        })
        const data = await res
          .json()
          .catch(() => ({})) as { estado?: string | null; error?: string | null }
        if (abort) return

        if (!res.ok) {
           if (intentosRef.current >= MAX_INTENTOS) {
            setError(data?.error ?? `Error ${res.status}`)
          } else {
            timeout = setTimeout(sync, RETRY_DELAY_MS)
          }
          return
        }

         const estadoNormalizado = typeof data?.estado === 'string'
          ? data.estado.toLowerCase()
          : undefined
        const nuevoEstado: EstadoPago =
          estadoNormalizado === 'pagado' ||
          estadoNormalizado === 'pendiente' ||
          estadoNormalizado === 'fallido' ||
          estadoNormalizado === 'reembolsado' ||
          estadoNormalizado === 'cancelado'
            ? estadoNormalizado
            : 'desconocido'

        setError(null)
        setEstado(nuevoEstado)
        if (nuevoEstado !== 'pagado') {
          if (intentosRef.current >= MAX_INTENTOS) {
            setError('No se pudo confirmar el estado del pago automáticamente')
          } else {
            timeout = setTimeout(sync, RETRY_DELAY_MS)
          }
        }
      } catch (e) {
        if (abort) return
        const message = e instanceof Error ? e.message : 'No se pudo confirmar el estado del pago'
        if (intentosRef.current >= MAX_INTENTOS) {
          setError(message)
        } else {
          timeout = setTimeout(sync, RETRY_DELAY_MS)
        }
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