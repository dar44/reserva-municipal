import type { CurrencyCode } from './currency'

export function getReservaPriceValue (): number {
  const raw =
    process.env.RESERVA_PRICE ??
    process.env.RESERVA_PRICE_CLP ??
    process.env.RESERVA_PRICE_EUR ??
    '0'

  const price = Number(raw)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Config error: RESERVA_PRICE inválido')
  }
  return price
}

export function getConfiguredCurrency (): CurrencyCode {
  return 'CLP'
}