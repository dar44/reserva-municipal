'use client'

import dynamic from 'next/dynamic'

export const LazyToastContainer = dynamic(
  () => import('./ToastProvider').then(mod => mod.ToastProvider),
  { ssr: false }
)
