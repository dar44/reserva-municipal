import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from '@/components/theme-provider'

import { MotionProvider } from '@/components/motion-provider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ServiMunicipal - Sistema de Reservas Municipales",
  description: "Plataforma de gestión de reservas para espacios, cursos y eventos municipales. Reserva de forma simple y rápida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://nwhvezrclrmoyrcnijaw.supabase.co" />
        <link rel="dns-prefetch" href="https://nwhvezrclrmoyrcnijaw.supabase.co" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            {children}
          </MotionProvider>
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
        </ThemeProvider>
      </body>
    </html>
  )
}