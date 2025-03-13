import { redirect } from "next/navigation"
import { createServerClient } from "@/utils/supabase/server"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}

