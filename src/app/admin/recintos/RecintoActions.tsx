'use client'

import Link from 'next/link'

export default function RecintoActions ({ id }: { id: number }) {
  return (
    <div className="space-x-2">
      <Link href={`/admin/recintos/${id}`} className="text-blue-400">Ver</Link>
      <Link href={`/admin/recintos/${id}/editar`} className="text-yellow-400">Modificar</Link>
      <Link href={`/admin/recintos/${id}/eliminar`} className="text-red-400">Eliminar</Link>
    </div>
  )
}