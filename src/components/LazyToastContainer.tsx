'use client'

import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export function LazyToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  )
}
