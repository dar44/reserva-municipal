import { motion } from 'framer-motion'

export const CourseCardSkeleton = () => (
    <div className="surface rounded-xl overflow-hidden shadow-md">
        <div className="animate-pulse">
            <div className="h-48 bg-muted" />

            <div className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />

                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-32" />
                </div>
            </div>
        </div>
    </div>
)

export const CourseCardSkeletonWithAnimation = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="surface rounded-xl overflow-hidden shadow-md"
    >
        <div className="animate-pulse">
            <div className="h-48 bg-muted relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <div className="h-4 bg-muted rounded w-5/6 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-muted rounded w-24 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <div className="h-4 bg-muted rounded w-32 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
)

export const CourseGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <CourseCardSkeletonWithAnimation key={index} delay={index * 0.1} />
        ))}
    </div>
)
