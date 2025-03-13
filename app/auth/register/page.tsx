import { redirect } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import RegisterForm from "@/components/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Register() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para comenzar a usar la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}

