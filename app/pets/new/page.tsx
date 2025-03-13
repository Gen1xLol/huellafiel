import { redirect } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import PetForm from "@/components/pet-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewPet() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado, redirigir a la página de inicio
  if (!session) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Registrar Nueva Mascota</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

