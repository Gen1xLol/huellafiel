import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GeolocationProvider } from "@/providers/geolocation-provider"
import { SupabaseProvider } from "@/providers/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HuellaFiel - Identificación de Mascotas",
  description: "Plataforma de identificación de mascotas en Argentina",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SupabaseProvider>
            <GeolocationProvider>
              <main className="min-h-screen bg-background paw-pattern">{children}</main>
              <Toaster />
            </GeolocationProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'