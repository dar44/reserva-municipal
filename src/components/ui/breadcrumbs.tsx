import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    showHome?: boolean
    homeHref?: string // Custom home link for different roles
}

export function Breadcrumbs({ items, showHome = true, homeHref = '/' }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
            {showHome && (
                <>
                    <Link
                        href={homeHref}
                        className="text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1"
                        aria-label="Inicio"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                    {items.length > 0 && <ChevronRight className="w-4 h-4 text-foreground-tertiary" />}
                </>
            )}

            {items.map((item, index) => {
                const isLast = index === items.length - 1

                return (
                    <div key={index} className="flex items-center gap-2">
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-foreground-secondary hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "text-foreground font-medium" : "text-foreground-secondary"}>
                                {item.label}
                            </span>
                        )}

                        {!isLast && <ChevronRight className="w-4 h-4 text-foreground-tertiary" />}
                    </div>
                )
            })}
        </nav>
    )
}
