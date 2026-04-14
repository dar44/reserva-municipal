'use client'

interface Props {
  open: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal ({ open, title = 'Confirmar', message, onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card text-card-foreground rounded p-6 w-full max-w-sm border border-card-border shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4 text-sm text-foreground-secondary">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-1 text-sm text-foreground-secondary hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-1 rounded bg-destructive text-destructive-foreground text-sm hover:bg-destructive-hover transition-colors">Aceptar</button>
        </div>
      </div>
    </div>
  )
}