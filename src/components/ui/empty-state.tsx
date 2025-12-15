'use client'

import { motion } from 'framer-motion'
import { SearchX, RefreshCw, CalendarX } from 'lucide-react'
import Link from 'next/link'
import { Button } from './button'

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
        label: string
        href: string
    }
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="col-span-full flex flex-col items-center justify-center py-16 px-4"
    >
        {/* Icon with pulsing effect */}
        <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                {icon || <SearchX className="w-16 h-16 text-primary/40" />}
            </div>
            {/* Pulsing ring */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-primary/20"
            />
        </div>

        <h3 className="text-2xl font-semibold text-foreground mb-2 text-center">
            {title}
        </h3>
        <p className="text-foreground-secondary text-center max-w-md mb-6">
            {description}
        </p>

        {action && (
            <Button asChild variant="outline" size="lg">
                <Link href={action.href}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {action.label}
                </Link>
            </Button>
        )}
    </motion.div>
)

// Predefined empty states
export const EmptyCoursesState = () => (
    <EmptyState
        title="No se encontraron cursos"
        description="No hay cursos disponibles con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda."
        action={{
            label: "Limpiar filtros",
            href: "/cursos"
        }}
    />
)

export const EmptyRecintosState = () => (
    <EmptyState
        title="No se encontraron recintos"
        description="No hay recintos disponibles en este momento. Prueba a buscar más tarde o contacta con el administrador."
        action={{
            label: "Volver al inicio",
            href: "/"
        }}
    />
)

export const EmptyReservasState = () => (
    <EmptyState
        icon={<CalendarX className="w-16 h-16 text-primary/40" />}
        title="No tienes reservas activas"
        description="Cuando realices una reserva de recinto o te inscribas en un curso, aparecerán aquí"
        action={{ label: "Explorar recintos", href: "/recintos" }}
    />
)

export const EmptyWorkerReservasState = () => (
    <EmptyState
        icon={<CalendarX className="w-16 h-16 text-primary/40" />}
        title="No hay reservas registradas"
        description="Las reservas realizadas por ciudadanos aparecerán aquí automáticamente"
        action={{ label: "Ver recintos disponibles", href: "/worker/recintos" }}
    />
)
