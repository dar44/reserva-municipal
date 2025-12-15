import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface MetricCardProps {
    title: string
    value: string | number
    icon?: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
        isPositive: boolean
    }
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const variantStyles = {
    default: 'border-border',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    error: 'border-error/20 bg-error/5',
    info: 'border-info/20 bg-info/5',
}

const iconColorStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    variant = 'default'
}: MetricCardProps) {
    return (
        <div className={`
      surface rounded-xl p-6 border ${variantStyles[variant]}
      shadow-sm hover:shadow-md transition-all duration-300
    `}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm text-foreground-secondary font-medium mb-1">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">
                            {value}
                        </p>
                        {trend && (
                            <span className={`text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-error'
                                }`}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}% {trend.label}
                            </span>
                        )}
                    </div>
                </div>

                {Icon && (
                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${iconColorStyles[variant]}`} />
                    </div>
                )}
            </div>

            {description && (
                <p className="text-xs text-foreground-tertiary">
                    {description}
                </p>
            )}
        </div>
    )
}
