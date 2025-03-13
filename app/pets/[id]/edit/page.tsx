import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import PetForm from "@/components/pet-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditPet({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado, redirigir a la página de inicio
  if (!session) {
    redirect("/")
  }

  // Obtener los datos de la mascota
  const { data: pet } = await supabase
    .from("pets")
    .select(`
      *,
      pet_photos(*)
    `)
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  // Si no se encuentra la mascota o no pertenece al usuario, mostrar 404
  if (!pet) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Mascota</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm userId={session.user.id} pet={pet} />
        </CardContent>
      </Card>
    </div>
  )
}

