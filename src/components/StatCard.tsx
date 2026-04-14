interface StatCardProps {
    label: string
    value: string | number
    className?: string
}

export default function StatCard({ label, value, className = '' }: StatCardProps) {
    return (
        <div className={`bg-card rounded-lg border border-card-border p-4 shadow-sm ${className}`}>
            <p className="text-sm text-foreground-secondary mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
    )
}
