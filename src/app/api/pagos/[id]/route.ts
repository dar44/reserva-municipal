import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findOrderByCheckoutId,
  getCheckoutStatus,
  getOrder
} from "@/lib/lemonSqueezy";
import {
  mapCheckoutStatusToPagoEstado,
  normalizePagoEstado,
  type PagoEstado
} from "@/lib/pagos";
import { notifyPagoConfirmado } from "@/lib/emailNotifications";

export const dynamic = "force-dynamic";



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
  previousEstado: PagoEstado,
  orderId: string | null,
  extraUpdates: Record<string, unknown> = {}
): Promise<void> {
  const updates: Record<string, unknown> = { estado, ...extraUpdates };
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
  await notifyPagoConfirmado({
    previousEstado,
    nextEstado: estado,
    reservaId: pago.reserva_id,
    inscripcionId: pago.inscripcion_id
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: pago } = await supabaseAdmin
    .from("pagos")
    .select("*")
    .eq("id", id)
    .single();

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

    let estado = mapCheckoutStatusToPagoEstado(checkout.status);
    let orderId = checkout.orderId ?? pago.order_id ?? null;
    const extraUpdates: Record<string, unknown> = {};

    if (estado === "pendiente" && orderId) {
      try {
        const order = await getOrder(orderId);
        const orderEstado = mapCheckoutStatusToPagoEstado(order.status);
        if (orderEstado !== "pendiente") {
          estado = orderEstado;
        }
        if (order.total != null) {
          extraUpdates.monto_centavos = order.total;
        }
        if (order.currency) {
          extraUpdates.moneda = order.currency;
        }
      } catch (orderError) {
        basePayload.orderSyncError =
          orderError instanceof Error ? orderError.message : "order_sync_failed";
      }
    }

     if (estado === "pendiente") {
      try {
        const order = await findOrderByCheckoutId(pago.checkout_id);
        if (order) {
          orderId = order.id;
          const orderEstado = mapCheckoutStatusToPagoEstado(order.status);
          if (orderEstado !== "pendiente") {
            estado = orderEstado;
          }
          if (order.total != null) {
            extraUpdates.monto_centavos = order.total;
          }
          if (order.currency) {
            extraUpdates.moneda = order.currency;
          }
        }
      } catch (orderLookupError) {
        basePayload.orderLookupError =
          orderLookupError instanceof Error
            ? orderLookupError.message
            : "order_lookup_failed";
      }
    }


    basePayload.estado = estado;
    if (orderId) {
      basePayload.orderId = orderId;
    }

    const shouldUpdate =
      estado !== currentEstado ||
      (orderId && orderId !== pago.order_id) ||
      Object.keys(extraUpdates).length > 0;

    if (shouldUpdate) {
      await applyEstadoUpdate(pago, estado, currentEstado, orderId, extraUpdates);
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