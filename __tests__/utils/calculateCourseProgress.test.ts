import { calculateCourseProgress } from '@/app/(citizen)/reservas/utils'

describe('calculateCourseProgress', () => {
    beforeEach(() => {
        // Mock current date to 2025-01-15 12:00:00
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns 0 when current date is before start date', () => {
        const startDate = '2025-01-20T00:00:00Z'
        const endDate = '2025-02-20T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        expect(progress).toBe(0)
    })

    it('returns 100 when current date is after end date', () => {
        const startDate = '2024-12-01T00:00:00Z'
        const endDate = '2025-01-01T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        expect(progress).toBe(100)
    })

    it('calculates progress correctly when course is in progress', () => {
        // Course runs from Jan 1 to Jan 31 (31 days)
        // Current date is Jan 15 (14 days elapsed out of 30)
        const startDate = '2025-01-01T00:00:00Z'
        const endDate = '2025-01-31T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        // 14 days / 30 days = 46.67% ≈ 47%
        expect(progress).toBeGreaterThanOrEqual(45)
        expect(progress).toBeLessThanOrEqual(50)
    })

    it('returns 50 when exactly at midpoint', () => {
        // Course from Jan 1 to Jan 31
        // Set current to Jan 16 (midpoint)
        jest.setSystemTime(new Date('2025-01-16T00:00:00Z'))

        const startDate = '2025-01-01T00:00:00Z'
        const endDate = '2025-01-31T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        expect(progress).toBe(50)
    })

    it('handles single day course starting today', () => {
        const startDate = '2025-01-15T00:00:00Z'
        const endDate = '2025-01-15T23:59:59Z'

        const progress = calculateCourseProgress(startDate, endDate)

        // Should be somewhere between 0 and 100 depending on time
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(100)
    })

    it('returns rounded integer percentage', () => {
        const startDate = '2025-01-01T00:00:00Z'
        const endDate = '2025-01-31T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        expect(Number.isInteger(progress)).toBe(true)
    })

    it('handles long duration courses correctly', () => {
        // 6 month course, 3 months in
        jest.setSystemTime(new Date('2025-04-01T00:00:00Z'))

        const startDate = '2025-01-01T00:00:00Z'
        const endDate = '2025-07-01T00:00:00Z'

        const progress = calculateCourseProgress(startDate, endDate)

        // Should be approximately 50%
        expect(progress).toBeGreaterThanOrEqual(48)
        expect(progress).toBeLessThanOrEqual(52)
    })

    it('handles courses starting and ending on same day but different times', () => {
        jest.setSystemTime(new Date('2025-01-15T15:00:00Z'))

        const startDate = '2025-01-15T09:00:00Z' // 9 AM
        const endDate = '2025-01-15T18:00:00Z'   // 6 PM

        const progress = calculateCourseProgress(startDate, endDate)

        // 6 hours into 9 hour course = 66.67%
        expect(progress).toBeGreaterThanOrEqual(60)
        expect(progress).toBeLessThanOrEqual(70)
    })

    it('handles edge case when start equals end', () => {
        const dateTime = '2025-01-15T12:00:00Z'

        const progress = calculateCourseProgress(dateTime, dateTime)

        // When start === end, avoid division by zero
        // Implementation should handle this gracefully
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(100)
    })
})
