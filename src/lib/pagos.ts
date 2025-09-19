export type PagoEstado =
  | 'pendiente'
  | 'pagado'
  | 'fallido'
  | 'reembolsado'
  | 'cancelado';

const TERMINAL_ESTADOS: PagoEstado[] = ['pagado', 'fallido', 'reembolsado', 'cancelado'];

function normalize(value?: string | null): PagoEstado {
  switch ((value ?? '').toLowerCase()) {
    case 'pagado':
      return 'pagado';
    case 'fallido':
      return 'fallido';
    case 'reembolsado':
      return 'reembolsado';
    case 'cancelado':
      return 'cancelado';
    default:
      return 'pendiente';
  }
}

export function normalizePagoEstado(value?: string | null): PagoEstado {
  return normalize(value);
}

export function isTerminalPagoEstado(estado: PagoEstado): boolean {
  return TERMINAL_ESTADOS.includes(estado);
}

export function mapLemonEventToPagoEstado(
  eventName?: string,
  status?: string
): PagoEstado {
  const event = (eventName ?? '').toLowerCase();
  const normalizedStatus = (status ?? '').toLowerCase();

  if (event === 'order_created' || normalizedStatus === 'paid') return 'pagado';
  if (event === 'order_refunded' || normalizedStatus === 'refunded') return 'reembolsado';
  if (event === 'order_payment_failed' || normalizedStatus === 'failed') return 'fallido';
  if (
    event === 'order_expired' ||
    event === 'order_cancelled' ||
    normalizedStatus === 'expired' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled'
  ) {
    return 'cancelado';
  }
  return 'pendiente';
}

export function mapCheckoutStatusToPagoEstado(status?: string | null): PagoEstado {
  const normalizedStatus = (status ?? '').toLowerCase();

  if (
    normalizedStatus === 'paid' ||
    normalizedStatus === 'succeeded' ||
    normalizedStatus === 'successful' ||
    normalizedStatus === 'complete' ||
    normalizedStatus === 'completed'
  ) {
    return 'pagado';
  }

  if (
    normalizedStatus === 'refunded' ||
    normalizedStatus === 'partially_refunded' ||
    normalizedStatus === 'charge_refunded'
  ) {
    return 'reembolsado';
  }

  if (
    normalizedStatus === 'failed' ||
    normalizedStatus === 'void' ||
    normalizedStatus === 'voided' ||
    normalizedStatus === 'declined' ||
    normalizedStatus === 'chargeback'
  ) {
    return 'fallido';
  }

  if (
    normalizedStatus === 'expired' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled' ||
    normalizedStatus === 'abandoned'
  ) {
    return 'cancelado';
  }

  return 'pendiente';
}