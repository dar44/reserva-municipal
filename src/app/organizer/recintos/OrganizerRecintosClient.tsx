'use client'

import Link from 'next/link'

interface Recinto {
    id: number
    name: string
    ubication: string | null
    state: string
}

interface Props {
    recintos: Recinto[]
}

export default function OrganizerRecintosClient({ recintos }: Props) {
    return (
        <section className="mx-auto max-w-5xl space-y-6 p-2 sm:p-4">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Recintos disponibles</h1>
                <p className="text-sm text-gray-400">
                    Consulta los recintos disponibles para solicitar
                </p>
            </header>

            {recintos?.length ? (
                <div className="overflow-x-auto rounded border border-gray-700 bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                    Ubicación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-900">
                            {recintos.map((recinto) => {
                                const isDisponible = recinto.state === 'Disponible'
                                return (
                                    <tr key={recinto.id} className="hover:bg-gray-800">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                                            {recinto.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                                            {recinto.ubication || 'No especificada'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDisponible
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {recinto.state}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {isDisponible ? (
                                                <Link
                                                    href={`/organizer/solicitudes?recinto=${recinto.id}`}
                                                    className="rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 inline-block"
                                                >
                                                    Solicitar
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="cursor-not-allowed rounded bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500"
                                                >
                                                    Solicitar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-400">No hay recintos disponibles por el momento.</p>
            )}
        </section>
    )
}
