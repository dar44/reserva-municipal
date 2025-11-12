import { formatCurrency, toMinorUnits } from '@/lib/currency'

describe('currency utilities', () => {
    describe('toMinorUnits', () => {
        it('convierte montos válidos en CLP a unidades menores', () => {
            expect(toMinorUnits(123.45)).toBe(12345)
            expect(toMinorUnits(999.999)).toBe(100000)
        })

        it('lanza error para valores no finitos', () => {
            expect(() => toMinorUnits(Number.NaN)).toThrow('Cantidad inválida')
            expect(() => toMinorUnits(Number.POSITIVE_INFINITY)).toThrow('Cantidad inválida')
        })

        it('lanza error para monedas no soportadas', () => {
            // @ts-expect-error testing unsupported currency guard
            expect(() => toMinorUnits(100, 'USD')).toThrow('Moneda no soportada')
        })
    })

    describe('formatCurrency', () => {
        it('formatea montos en CLP', () => {
            expect(formatCurrency(12345.67)).toBe('$12.346')
        })

        it('rechaza monedas no soportadas', () => {
            // @ts-expect-error testing unsupported currency guard
            expect(() => formatCurrency(100, 'USD')).toThrow('Moneda no soportada')
        })
    })
})