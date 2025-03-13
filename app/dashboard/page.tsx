import { redirect } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard-header"
import PetsList from "@/components/pets-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function Dashboard() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado, redirigir a la página de inicio
  if (!session) {
    redirect("/")
  }

  // Obtener las mascotas del usuario
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis Mascotas</h1>
        <Link href="/pets/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Mascota
          </Button>
        </Link>
      </div>

      <PetsList pets={pets || []} />
    </div>
  )
}

