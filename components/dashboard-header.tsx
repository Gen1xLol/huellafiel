"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Search, User, LogOut, PawPrintIcon as Paw, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="border-b glass-effect sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/dashboard" className="flex items-center">
          <Paw className="h-6 w-6 text-primary mr-2" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            HuellaFiel
          </span>
        </Link>
        <nav className="ml-auto flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="rounded-full">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          </Link>
          <Link href="/find-pet">
            <Button variant="ghost" size="sm" className="rounded-full">
              <Search className="h-4 w-4 mr-2" />
              Buscar Mascota
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">Mi Cuenta</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}

