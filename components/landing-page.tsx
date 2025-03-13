import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PawPrintIcon as Paw, Shield, Camera, Search, Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center glass-effect sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center">
          <Paw className="h-6 w-6 text-primary mr-2" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            HuellaFiel
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/auth/login">
            <Button variant="ghost" className="rounded-full">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-full shadow-sm">Registrarse</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 hero-gradient">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-2 w-fit">
                  <Shield className="h-4 w-4 mr-1" /> Seguridad para tus mascotas
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                    Identificación Digital para tu Mascota
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Crea un perfil digital para tu mascota, sube fotos y guarda información de contacto. Utiliza nuestra
                    tecnología de reconocimiento de imágenes para encontrar mascotas similares.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full rounded-full shadow-md">
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="w-full rounded-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full overflow-hidden border-none shadow-soft rounded-2xl animate-float">
                  <CardContent className="p-0">
                    <img
                      alt="Mascota con identificación"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                      height="310"
                      src="/placeholder.svg?height=310&width=550"
                      width="550"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Características Principales
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Todo lo que necesitas para mantener la información de tu mascota segura y accesible
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <Card className="card-hover animated-border">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Paw className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Perfiles de Mascotas</h3>
                  <p className="text-muted-foreground">
                    Crea perfiles detallados para cada una de tus mascotas con toda la información importante
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover animated-border">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Múltiples Fotos</h3>
                  <p className="text-muted-foreground">
                    Sube varias fotos para identificar mejor a tu mascota desde diferentes ángulos
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover animated-border">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Reconocimiento de Imágenes</h3>
                  <p className="text-muted-foreground">
                    Encuentra mascotas similares usando nuestra avanzada tecnología de IA
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-2 w-fit">
                  <Heart className="h-4 w-4 mr-1" /> Objetivo puro
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ayudamos a reunir mascotas con sus familias
                </h2>
                <p className="text-muted-foreground">
                  Nuestra plataforma tiene el potencial de ayudar a cientos de familias a reencontrarse con sus mascotas
                  perdidas gracias a nuestra tecnología de reconocimiento de imágenes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register">
                    <Button className="rounded-full">Únete a HuellaFiel</Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      alt="Historia de éxito 1"
                      className="w-full h-full object-cover aspect-square"
                      src="/placeholder.svg?height=200&width=200"
                    />
                  </CardContent>
                </Card>
                <Card className="overflow-hidden row-span-2">
                  <CardContent className="p-0">
                    <img
                      alt="Historia de éxito 2"
                      className="w-full h-full object-cover"
                      src="/placeholder.svg?height=400&width=200"
                    />
                  </CardContent>
                </Card>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      alt="Historia de éxito 3"
                      className="w-full h-full object-cover aspect-square"
                      src="/placeholder.svg?height=200&width=200"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Paw className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold text-white">HuellaFiel</span>
              </div>
              <p className="text-sm text-gray-400">Plataforma de identificación digital para mascotas en Argentina.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-gray-400 hover:text-primary transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-400 hover:text-primary transition-colors">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/legal/terminos" className="text-gray-400 hover:text-primary transition-colors">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacidad" className="text-gray-400 hover:text-primary transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 HuellaFiel. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

