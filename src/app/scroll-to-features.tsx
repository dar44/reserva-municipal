'use client'

export function ScrollToFeatures() {
  return (
    <button
      onClick={() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="px-10 py-5 bg-surface hover:bg-surface-secondary border-2 border-border hover:border-primary/30 rounded-xl font-semibold text-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[200px]"
      aria-label="Conocer más sobre las características del sistema"
    >
      Conocer más
    </button>
  )
}
