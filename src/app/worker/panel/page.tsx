//app/worker/panel/page.tsx
import Link from "next/link";

export default function WorkerPanelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel del Trabajador Municipal</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Recintos Deportivos</h2>
          <p className="text-sm text-gray-300 flex-1">Consulta los recintos y realiza reservas para los ciudadanos.</p>
          <Link href="/worker/recintos" className="mt-4 bg-blue-600 px-3 py-1 rounded text-center text-sm">Ver Recintos</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Cursos Disponibles</h2>
          <p className="text-sm text-gray-300 flex-1">Consulta los cursos y realiza inscripciones para los ciudadanos.</p>
          <Link href="/worker/cursos" className="mt-4 bg-blue-600 px-3 py-1 rounded text-center text-sm">Ver Cursos</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Solicitudes</h2>
          <p className="text-sm text-gray-300 flex-1">Gestiona las solicitudes de recintos enviadas por los organizadores de cursos.</p>
          <Link href="/worker/solicitudes" className="mt-4 bg-blue-600 px-3 py-1 rounded text-center text-sm">Ver Solicitudes</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Reservas</h2>
          <p className="text-sm text-gray-300 flex-1">Consulta las reservas ciudadanas y valida las solicitudes de recintos para cursos.</p>
          <Link href="/worker/reservas" className="mt-4 bg-blue-600 px-3 py-1 rounded text-center text-sm">Ver Reservas</Link>
        </div>
      </div>
    </div>
  );
}