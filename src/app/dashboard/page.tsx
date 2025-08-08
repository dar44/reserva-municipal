import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function AdminDashboard () {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Recintos</h2>
          <p className="text-sm text-gray-300 flex-grow">Administra los recintos municipales.</p>
          <Link href="/dashboard/recintos" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded">Gestionar Recintos</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Cursos</h2>
          <p className="text-sm text-gray-300 flex-grow">Controla la oferta de cursos.</p>
          <Link href="/dashboard/cursos" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded">Gestionar Cursos</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Usuarios</h2>
          <p className="text-sm text-gray-300 flex-grow">Gestiona los usuarios del sistema.</p>
          <Link href="/dashboard/usuarios" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded">Gestionar Usuarios</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Reservas</h2>
          <p className="text-sm text-gray-300 flex-grow">Revisa las reservas realizadas.</p>
          <Link href="/dashboard/reservas" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded">Ver Reservas</Link>
        </div>
      </div>
    </div>
  )
}