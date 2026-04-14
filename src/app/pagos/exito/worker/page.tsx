import Link from 'next/link'
import SyncPago from '../SyncPago'

export const dynamic = 'force-dynamic'

type SearchParams = {
  pago?: string
  tipo?: string
  curso?: string
}

export default async function PagoExitoWorkerPage ({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const pagoId = params.pago
  const tipoRaw = params.tipo === 'inscripcion' ? 'inscripción' : 'reserva'
  const cursoId = params.curso

  let href = '/worker/reservas'
  let label = 'Volver a mis reservas'

  if (params.tipo === 'inscripcion') {
    href = cursoId ? `/worker/cursos/${cursoId}` : '/worker/cursos'
    label = 'Volver al curso'
  }

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-3xl font-bold text-success">Pago registrado</h1>
      <p>
        El pago se ha completado correctamente. Estamos sincronizando la {tipoRaw} para que
        aparezca como pagada en el panel de trabajo.
      </p>
      {pagoId && (
        <>
          <p className="text-sm text-foreground-secondary">Identificador interno del pago: {pagoId}</p>
          <SyncPago pagoId={pagoId} />
        </>
      )}
      <Link
        href={href}
        className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded"
      >
        {label}
      </Link>
    </div>
  )
}