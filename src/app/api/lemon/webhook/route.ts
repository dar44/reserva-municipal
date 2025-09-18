import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyWebhookSignature } from '@/lib/lemonSqueezy';

export const dynamic = 'force-dynamic';

type LemonWebhookPayload = {
  meta?: { event_name?: string };
  event_name?: string;
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      order_id?: string | number;
      order_identifier?: string | number;
      identifier?: string | number;
      custom_fields?: Record<string, unknown>;
      custom?: Record<string, unknown>;
    };
  };
};

function mapEstado(
  eventName?: string,
  status?: string
): 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'cancelado' {
  const event = eventName?.toLowerCase() ?? '';
  const normalizedStatus = status?.toLowerCase() ?? '';

  if (event === 'order_created' || normalizedStatus === 'paid') return 'pagado';
  if (event === 'order_refunded' || normalizedStatus === 'refunded') return 'reembolsado';
  if (event === 'order_payment_failed' || normalizedStatus === 'failed') return 'fallido';
  if (
    event === 'order_expired' ||
    event === 'order_cancelled' ||
    normalizedStatus === 'expired' ||
    normalizedStatus === 'cancelled'
  ) {
    return 'cancelado';
  }
  return 'pendiente';
}

export async function POST (req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonWebhookPayload;
  const eventName: string | undefined = payload.meta?.event_name ?? payload.event_name;
  const data = payload.data ?? {};
  const attributes = data.attributes ?? {};
  const customFields = (attributes.custom_fields ?? attributes.custom ?? {}) as Record<string, unknown>;
  const pagoIdRaw = customFields.pago_id ?? customFields.pagoId;
  const pagoId =
    typeof pagoIdRaw === 'string'
      ? pagoIdRaw
      : typeof pagoIdRaw === 'number'
        ? pagoIdRaw.toString()
        : undefined;

  if (!pagoId) {
    return NextResponse.json({ error: 'missing_pago_id' }, { status: 400 });
  }

  const orderIdentifier =
    attributes.order_id ??
    attributes.order_identifier ??
    attributes.identifier ??
    data.id ?? null;

  const estado = mapEstado(eventName, attributes.status);

  const { data: pago, error: pagoErr } = await supabaseAdmin
    .from('pagos')
    .update({
      estado,
      order_id: orderIdentifier ?? undefined,
      payload_raw: payload
    })
    .eq('id', pagoId)
    .select('id,reserva_id,inscripcion_id')
    .maybeSingle();

  if (pagoErr || !pago) {
    return NextResponse.json({ error: pagoErr?.message || 'pago_not_found' }, { status: 400 });
  }

  const paid = estado === 'pagado';

  if (pago.reserva_id) {
    await supabaseAdmin
      .from('reservas')
      .update({ paid })
      .eq('id', pago.reserva_id);
  }

  if (pago.inscripcion_id) {
    await supabaseAdmin
      .from('inscripciones')
      .update({ paid })
      .eq('id', pago.inscripcion_id);
  }

  return NextResponse.json({ ok: true });
}