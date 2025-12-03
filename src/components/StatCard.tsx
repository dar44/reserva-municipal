interface StatCardProps {
    label: string
    value: string | number
    className?: string
}

export default function StatCard({ label, value, className = '' }: StatCardProps) {
    return (
        <div className={`bg-gray-800 rounded-lg border border-gray-700 p-4 ${className}`}>
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    )
}
