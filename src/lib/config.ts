import type { CurrencyCode } from './currency'

const FALLBACK_RESERVA_PRICE = 500

export function getReservaPriceValue (): number {
  const raw =
    process.env.RESERVA_PRICE ??
    process.env.RESERVA_PRICE_CLP

  if (raw === undefined) {
    return FALLBACK_RESERVA_PRICE
  }

  const price = Number(raw)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Config error: RESERVA_PRICE inválido')
  }
  return price
}

export function getConfiguredCurrency (): CurrencyCode {
  return 'CLP'
}