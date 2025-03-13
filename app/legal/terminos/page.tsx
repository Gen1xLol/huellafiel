import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrintIcon as Paw, ArrowLeft } from "lucide-react"

export default function TerminosServicio() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center glass-effect sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center">
          <Paw className="h-6 w-6 text-primary mr-2" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            HuellaFiel
          </span>
        </Link>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>

          <div className="prose prose-green max-w-none">
            <p className="text-muted-foreground">Última actualización: 10 de marzo de 2025</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar HuellaFiel ("el Servicio"), usted acepta estar sujeto a estos Términos de Servicio.
              Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Descripción del Servicio</h2>
            <p>
              HuellaFiel es una plataforma de identificación digital para mascotas que permite a los usuarios crear
              perfiles para sus mascotas, subir fotos y utilizar tecnología de reconocimiento de imágenes para
              identificar mascotas.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Cuentas de Usuario</h2>
            <p>
              Para utilizar ciertas funciones del Servicio, debe registrarse y mantener una cuenta activa. Usted es
              responsable de mantener la confidencialidad de su cuenta y contraseña, y acepta la responsabilidad de
              todas las actividades que ocurran bajo su cuenta.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Contenido del Usuario</h2>
            <p>
              Al subir contenido a HuellaFiel, usted otorga al Servicio una licencia mundial, no exclusiva y libre de
              regalías para usar, reproducir y mostrar dicho contenido en relación con el Servicio.
            </p>
            <p>
              Usted es el único responsable de todo el contenido que publique o transmita a través del Servicio, y
              garantiza que tiene todos los derechos necesarios para otorgar los derechos concedidos en estos Términos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Uso Aceptable</h2>
            <p>Usted acepta no utilizar el Servicio para:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Violar cualquier ley aplicable o regulación.</li>
              <li>
                Infringir los derechos de cualquier tercero, incluidos derechos de autor, marca registrada, privacidad o
                derechos de publicidad.
              </li>
              <li>
                Transmitir cualquier material que sea difamatorio, obsceno, amenazante o invasivo de la privacidad de
                otra persona.
              </li>
              <li>Intentar interferir con el funcionamiento adecuado del Servicio.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso HuellaFiel, sus directores, empleados o agentes serán responsables de cualquier daño
              directo, indirecto, incidental, especial, punitivo o consecuente que surja del uso del Servicio.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Modificaciones del Servicio</h2>
            <p>
              HuellaFiel se reserva el derecho de modificar o descontinuar, temporal o permanentemente, el Servicio o
              cualquier parte del mismo con o sin previo aviso.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Modificaciones de los Términos</h2>
            <p>
              HuellaFiel se reserva el derecho de modificar estos Términos de Servicio en cualquier momento. Le
              notificaremos de cualquier cambio publicando los nuevos Términos de Servicio en esta página.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Ley Aplicable</h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de Argentina, sin tener en cuenta sus
              disposiciones sobre conflictos de leyes.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">10. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de info@huellafiel.com.ar
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 HuellaFiel. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

