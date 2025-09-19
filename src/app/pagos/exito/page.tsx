import Link from 'next/link'
import SyncPago from './SyncPago'

export const dynamic = 'force-dynamic'

type SearchParams = {
  pago?: string
  tipo?: string
}

export default async function PagoExitoPage ({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tipo = params.tipo === 'inscripcion' ? 'inscripción' : 'reserva'
  const pagoId = params.pago
  const href = params.tipo === 'inscripcion' ? '/cursos' : '/reservas'
  const label = params.tipo === 'inscripcion' ? 'Volver a cursos' : 'Ver mis reservas'

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-3xl font-bold text-green-500">Pago completado</h1>
      <p>
        Hemos recibido correctamente tu pago. Estamos confirmando la {tipo} con la pasarela
        y el estado cambiará automáticamente a pagado en unos instantes.
      </p>
      {pagoId && (
        <>
          <p className="text-sm text-gray-400">Identificador de pago: {pagoId}</p>
          <SyncPago pagoId={pagoId} />
        </>
      )}
      <Link
        href={href}
        className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
      >
        {label}
      </Link>
    </div>
  )
}