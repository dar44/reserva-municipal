import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  pago?: string;
  tipo?: string;
};

export default async function PagoCanceladoPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tipo = params.tipo === "inscripcion" ? "inscripción" : "reserva";
  const href = params.tipo === "inscripcion" ? "/cursos" : "/reservas";
  const label = params.tipo === "inscripcion" ? "Volver a cursos" : "Volver a reservas";

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-3xl font-bold text-yellow-500">Pago cancelado</h1>
      <p>
        El proceso de pago se canceló. Tu {tipo} continuará pendiente hasta que completes
        el pago. Puedes volver a intentarlo cuando quieras.
      </p>
      <Link
        href={href}
        className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
      >
        {label}
      </Link>
    </div>
  );
}