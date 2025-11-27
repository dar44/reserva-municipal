import {
    isTerminalPagoEstado,
    mapCheckoutStatusToPagoEstado,
    mapLemonEventToPagoEstado,
    normalizePagoEstado,
    type PagoEstado
} from '@/lib/pagos'

describe('pagos utilities', () => {
    describe('normalizePagoEstado', () => {
        it('normaliza entradas con mayúsculas y minúsculas mezcladas', () => {
            expect(normalizePagoEstado('PaGaDo')).toBe('pagado')
            expect(normalizePagoEstado('FALLIDO')).toBe('fallido')
            expect(normalizePagoEstado('ReEmbolsado')).toBe('reembolsado')
            expect(normalizePagoEstado('CANCELADO')).toBe('cancelado')
        })

        it('por defecto devuelve pendiente para entradas desconocidas o vacías', () => {
            expect(normalizePagoEstado('')).toBe('pendiente')
            expect(normalizePagoEstado(null)).toBe('pendiente')
            expect(normalizePagoEstado(undefined)).toBe('pendiente')
            expect(normalizePagoEstado('otro')).toBe('pendiente')
        })
    })

    describe('isTerminalPagoEstado', () => {
        const terminal: PagoEstado[] = ['pagado', 'fallido', 'reembolsado', 'cancelado']
        const nonTerminal: PagoEstado[] = ['pendiente']

        it('identifica estados terminales', () => {
            for (const estado of terminal) {
                expect(isTerminalPagoEstado(estado)).toBe(true)
            }
        })

        it('identifica estados no terminales', () => {
            for (const estado of nonTerminal) {
                expect(isTerminalPagoEstado(estado)).toBe(false)
            }
        })
    })

    describe('mapLemonEventToPagoEstado', () => {
        it('mapea señales de pago a pagado', () => {
            expect(mapLemonEventToPagoEstado('order_created')).toBe('pagado')
            expect(mapLemonEventToPagoEstado(undefined, 'PAID')).toBe('pagado')
        })

        it('mapea señales de reembolso a reembolsado', () => {
            expect(mapLemonEventToPagoEstado('order_refunded')).toBe('reembolsado')
            expect(mapLemonEventToPagoEstado(undefined, 'REFUNDED')).toBe('reembolsado')
        })

        it('mapea señales de fallo a fallido', () => {
            expect(mapLemonEventToPagoEstado('order_payment_failed')).toBe('fallido')
            expect(mapLemonEventToPagoEstado(undefined, 'FAILED')).toBe('fallido')
        })

        it('mapea señales de cancelación a cancelado', () => {
            expect(mapLemonEventToPagoEstado('order_cancelled')).toBe('cancelado')
            expect(mapLemonEventToPagoEstado('order_expired')).toBe('cancelado')
            expect(mapLemonEventToPagoEstado(undefined, 'CANCELED')).toBe('cancelado')
        })

        it('por defecto devuelve pendiente para eventos desconocidos', () => {
            expect(mapLemonEventToPagoEstado('unknown_event', 'processing')).toBe('pendiente')
        })
    })

    describe('mapCheckoutStatusToPagoEstado', () => {
        it('mapea estados de checkout exitosos a pagado', () => {
            expect(mapCheckoutStatusToPagoEstado('PAID')).toBe('pagado')
            expect(mapCheckoutStatusToPagoEstado('completed')).toBe('pagado')
        })

        it('mapea estados de checkout de reembolso a reembolsado', () => {
            expect(mapCheckoutStatusToPagoEstado('REFUNDED')).toBe('reembolsado')
            expect(mapCheckoutStatusToPagoEstado('partially_refunded')).toBe('reembolsado')
        })

        it('mapea estados de checkout fallidos a fallido', () => {
            expect(mapCheckoutStatusToPagoEstado('FAILED')).toBe('fallido')
            expect(mapCheckoutStatusToPagoEstado('voided')).toBe('fallido')
        })

        it('mapea estados de checkout cancelados a cancelado', () => {
            expect(mapCheckoutStatusToPagoEstado('CANCELED')).toBe('cancelado')
            expect(mapCheckoutStatusToPagoEstado('abandoned')).toBe('cancelado')
        })

        it('por defecto devuelve pendiente para estados desconocidos', () => {
            expect(mapCheckoutStatusToPagoEstado('processing')).toBe('pendiente')
            expect(mapCheckoutStatusToPagoEstado(undefined)).toBe('pendiente')
        })
    })
})