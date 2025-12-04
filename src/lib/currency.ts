export type CurrencyCode = 'CLP'

export function toMinorUnits(amount: number, currency: CurrencyCode = 'CLP'): number {
  if (!Number.isFinite(amount)) {
    throw new Error('Cantidad inválida')
  }

  if (currency !== 'CLP') {
    throw new Error('Moneda no soportada')
  }

  return Math.round(amount * 100)
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'CLP'): string {
  if (currency !== 'CLP') {
    throw new Error('Moneda no soportada')
  }

  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency
    }).format(amount)
  } catch {
    // formato simple de respaldo
    return `${Math.round(amount).toString()} CLP`
  }
}