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
      <div className="bg-white text-gray-900 rounded p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4 text-sm">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-1 text-sm">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-1 rounded bg-red-600 text-white text-sm">Aceptar</button>
        </div>
      </div>
    </div>
  )
}