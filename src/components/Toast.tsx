'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

export function ToastProvider ({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null)

  function show ({ message, type }: Omit<Toast, 'id'>) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  useEffect(() => {
    if (typeof document === 'undefined') return

    const node = document.createElement('div')
    node.dataset.toastPortal = 'true'
    document.body.appendChild(node)
    setPortalNode(node)

    return () => {
      setPortalNode(null)
      document.body.removeChild(node)
    }
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {portalNode
        ? createPortal(
          <div
            className="pointer-events-none fixed top-4 right-4 space-y-2"
            role="region"
            aria-live="polite"
            style={{ zIndex: 2147483647 }}
          >
            {toasts.map(t => (
              <div
                key={t.id}
                className={`pointer-events-auto rounded px-4 py-2 text-white shadow ${
                  t.type === 'success'
                    ? 'bg-green-600'
                    : t.type === 'error'
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                }`}
              >
                {t.message}
              </div>
            ))}
          </div>,
          portalNode,
        )
        : null}
    </ToastContext.Provider>
  )
}

export function useToast () {
  return useContext(ToastContext)
}