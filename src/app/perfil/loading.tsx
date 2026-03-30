import { ArrowLeft, UserCircle2 } from 'lucide-react'

export default function LoadingProfile() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-2xl">
        <div className="card-base space-y-8 animate-pulse">

          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 -ml-2 rounded-md text-muted-foreground"
                disabled
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-32 bg-surface-secondary rounded-md" />
            </div>
            <div className="h-9 w-28 bg-surface-secondary rounded-md" />
          </div>

          {/* Avatar Skeleton */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-surface-secondary ring-2 ring-border flex items-center justify-center">
              <UserCircle2 className="h-14 w-14 text-muted-foreground opacity-50" />
            </div>
          </div>

          <hr className="border-border" />

          {/* Fields Skeleton */}
          <div className="space-y-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="grid grid-cols-3 items-center gap-4">
                <div className="col-span-1">
                  <div className="h-5 w-20 bg-surface-secondary rounded-md" />
                </div>
                <div className="col-span-2">
                  <div className="h-5 w-48 bg-surface-secondary rounded-md" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
