"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Inicio de sesión exitoso",
      description: "Bienvenido de nuevo",
    })

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/auth/reset-password" className="text-sm text-primary underline-offset-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
      <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
          Regístrate
        </Link>
      </div>
    </form>
  )
}

