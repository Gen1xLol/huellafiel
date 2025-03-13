"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface GeolocationContextType {
  isArgentina: boolean
  isLoading: boolean
  error: string | null
}

const GeolocationContext = createContext<GeolocationContextType>({
  isArgentina: false,
  isLoading: true,
  error: null,
})

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<GeolocationContextType>({
    isArgentina: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const checkLocation = async () => {
      try {
        setState({
          isArgentina: false,
          isLoading: true,
          error: null,
        })

        // Use ipapi.co - a free IP geolocation API (no API key required for basic usage)
        const response = await fetch('https://ipapi.co/json/')
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data')
        }
        
        const data = await response.json()
        
        // Check if user is in Argentina (country_code = AR)
        const isArgentina = data.country_code === 'AR'

        setState({
          isArgentina,
          isLoading: false,
          error: null,
        })

        if (!isArgentina) {
          toast({
            title: "Acceso restringido",
            description: "Esta plataforma solo está disponible en Argentina",
            variant: "destructive",
          })

          // Redirect to a restricted access page
          router.push("/restricted")
        }
      } catch (error: any) {
        setState({
          isArgentina: false,
          isLoading: false,
          error: error.message || 'Error checking location',
        })
        
        toast({
          title: "Error",
          description: "No pudimos verificar tu ubicación. Por favor, intenta de nuevo más tarde.",
          variant: "destructive",
        })
      }
    }

    checkLocation()
  }, [router, toast])

  return <GeolocationContext.Provider value={state}>{children}</GeolocationContext.Provider>
}

export const useGeolocation = () => useContext(GeolocationContext)

