import { cn } from '@/lib/utils'

interface ProgressBarProps {
    value: number // 0-100
    max?: number
    label?: string
    showPercentage?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'success' | 'warning' | 'error'
    className?: string
}

const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
}

const variantStyles = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
}

export function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = false,
    size = 'md',
    variant = 'default',
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    // Auto variant based on percentage
    const autoVariant =
        percentage >= 80 ? 'success' :
            percentage >= 50 ? 'default' :
                percentage >= 20 ? 'warning' :
                    'error'

    const finalVariant = variant === 'default' ? autoVariant : variant

    return (
        <div className={cn('w-full', className)}>
            {(label || showPercentage) && (
                <div className="flex items-center justify-between mb-2">
                    {label && <span className="text-sm text-foreground-secondary">{label}</span>}
                    {showPercentage && (
                        <span className="text-sm font-medium text-foreground">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}

            <div className={cn(
                'w-full bg-muted rounded-full overflow-hidden',
                sizeStyles[size]
            )}>
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out rounded-full',
                        variantStyles[finalVariant]
                    )}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
        </div>
    )
}
