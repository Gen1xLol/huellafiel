import { redirect } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import FindPetForm from "@/components/find-pet-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FindPet() {
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
          <CardTitle>Buscar Mascota por Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <FindPetForm userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

