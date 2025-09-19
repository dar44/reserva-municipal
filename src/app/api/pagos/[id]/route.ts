import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCheckoutStatus } from "@/lib/lemonSqueezy";
import {
  mapCheckoutStatusToPagoEstado,
  normalizePagoEstado,
  type PagoEstado
} from "@/lib/pagos";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { id: string };
};

type PagoRecord = {
  id: string;
  estado: string | null;
  checkout_id: string | null;
  order_id: string | null;
  reserva_id: number | null;
  inscripcion_id: number | null;
};

async function applyEstadoUpdate(
  pago: PagoRecord,
  estado: PagoEstado,
  orderId: string | null
): Promise<void> {
  const updates: Record<string, unknown> = { estado };
  if (orderId) {
    updates.order_id = orderId;
  }

  await supabaseAdmin
    .from("pagos")
    .update(updates)
    .eq("id", pago.id);

  const paid = estado === "pagado";
  if (pago.reserva_id) {
    await supabaseAdmin
      .from("reservas")
      .update({ paid })
      .eq("id", pago.reserva_id);
  }

  if (pago.inscripcion_id) {
    await supabaseAdmin
      .from("inscripciones")
      .update({ paid })
      .eq("id", pago.inscripcion_id);
  }
}

export async function GET(
  _req: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const pagoId = params.id;

  if (!pagoId) {
    return NextResponse.json({ error: "missing_pago_id" }, { status: 400 });
  }

  const { data, error: pagoErr } = await supabaseAdmin
    .from("pagos")
    .select("id,estado,checkout_id,order_id,reserva_id,inscripcion_id")
    .eq("id", pagoId)
    .maybeSingle();

  const pago = data as PagoRecord | null;

  if (pagoErr) {
    return NextResponse.json({ error: pagoErr.message }, { status: 500 });
  }

  if (!pago) {
    return NextResponse.json({ error: "pago_not_found" }, { status: 404 });
  }

  const currentEstado = normalizePagoEstado(pago.estado);
  const basePayload: Record<string, unknown> = {
    pagoId: pago.id,
    estado: currentEstado
  };

  if (currentEstado !== "pendiente") {
    return NextResponse.json(basePayload);
  }

  if (!pago.checkout_id) {
    return NextResponse.json(basePayload);
  }

  try {
    const checkout = await getCheckoutStatus(pago.checkout_id);
    if (!checkout) {
      return NextResponse.json(basePayload);
    }

    const estado = mapCheckoutStatusToPagoEstado(checkout.status);
    const orderId = checkout.orderId ?? pago.order_id ?? null;

    basePayload.estado = estado;
    if (orderId) {
      basePayload.orderId = orderId;
    }

    if (estado !== currentEstado || (orderId && orderId !== pago.order_id)) {
      await applyEstadoUpdate(pago, estado, orderId);
      basePayload.synced = true;
    } else {
      basePayload.synced = false;
    }

    return NextResponse.json(basePayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync_failed";
    basePayload.error = message;
    return NextResponse.json(basePayload, { status: 502 });
  }
}