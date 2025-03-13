"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

const SupabaseContext = createContext(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente",
        })
      }
      if (event === "SIGNED_OUT") {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, toast])

  return <SupabaseContext.Provider value={null}>{children}</SupabaseContext.Provider>
}

