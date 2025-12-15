/**
 * Calculate course progress based on start and end dates
 * @param startDate - ISO string of course start date
 * @param endDate - ISO string of course end date
 * @returns Progress percentage (0-100)
 */
export function calculateCourseProgress(startDate: string, endDate: string): number {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 0
    if (now > end) return 100

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()

    // Avoid division by zero
    if (total === 0) return 100

    return Math.round((elapsed / total) * 100)
}
