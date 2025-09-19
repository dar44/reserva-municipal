import { createServerClient } from "@supabase/ssr";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConfiguredCurrency, getReservaPriceValue } from "@/lib/config";
import { formatCurrency } from "@/lib/currency";
import ReservationForm from "./ReservationForm";

export const dynamic = "force-dynamic";

export default async function RecintoDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        }
      }
    }
  );
  const { data: recinto } = await supabase
    .from("recintos")
    .select("*")
    .eq("id", id)
    .single();

  if (!recinto) return notFound();

  const slots = Array.from({ length: 12 }, (_, i) => {
    const start = 8 + i;
    const end = start + 1;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(start)}:00-${pad(end)}:00`;
  });

  let priceLabel = "Pago";
  try {
    const currency = getConfiguredCurrency();
    const reservaPrice = getReservaPriceValue();
    priceLabel = formatCurrency(reservaPrice, currency);
  } catch {
    priceLabel = "Pago";
  }

  return (
    <div className="space-y-6">
      <Link href="/recintos" className="text-sm underline">← Volver al listado</Link>
      <div className="grid md:grid-cols-2 gap-8 bg-gray-800 rounded-lg p-6 shadow">
         <div className="relative h-64 bg-gray-700 flex items-center justify-center text-gray-400">
          {recinto.image ? (
            <Image
              src={recinto.image}
              alt={recinto.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            "Imagen"
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{recinto.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs ${recinto.state==='Disponible'?'bg-green-700':'bg-red-700'}`}>{recinto.state}</span>
          </div>
          <p><strong>Ubicación:</strong> {recinto.ubication}</p>
          <p><strong>Descripción:</strong> {recinto.description}</p>

          {/* Reservar horario */}
            {recinto.state==='Disponible' && (
               <ReservationForm recintoId={recinto.id} slots={slots} priceLabel={priceLabel} />
            )}
          </div>
        </div>
      </div>
    );
  }