import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrintIcon as Paw, ArrowLeft } from "lucide-react"

export default function PoliticaPrivacidad() {
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

          <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

          <div className="prose prose-green max-w-none">
            <p className="text-muted-foreground">Última actualización: 10 de marzo de 2025</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introducción</h2>
            <p>
              En HuellaFiel, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política
              de Privacidad describe cómo recopilamos, utilizamos y compartimos su información cuando utiliza nuestra
              plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Información que Recopilamos</h2>
            <p>Recopilamos varios tipos de información, incluyendo:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>
                <strong>Información de registro:</strong> Cuando crea una cuenta, recopilamos su nombre, dirección de
                correo electrónico y contraseña.
              </li>
              <li>
                <strong>Información de perfil:</strong> Información sobre sus mascotas, incluyendo nombre, especie,
                raza, edad, color y fotos.
              </li>
              <li>
                <strong>Información de contacto:</strong> Datos de contacto que proporciona para cada mascota.
              </li>
              <li>
                <strong>Información de uso:</strong> Datos sobre cómo interactúa con nuestra plataforma, incluyendo
                búsquedas y visualizaciones de perfiles.
              </li>
              <li>
                <strong>Información del dispositivo:</strong> Datos técnicos como su dirección IP, tipo de navegador y
                sistema operativo.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Cómo Utilizamos su Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
              <li>Procesar y completar transacciones.</li>
              <li>Enviar información técnica, actualizaciones y mensajes de soporte.</li>
              <li>Responder a sus comentarios y preguntas.</li>
              <li>Desarrollar nuevos productos y servicios.</li>
              <li>Monitorear y analizar tendencias, uso y actividades.</li>
              <li>Detectar, investigar y prevenir actividades fraudulentas y no autorizadas.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Compartir su Información</h2>
            <p>
              No vendemos ni alquilamos su información personal a terceros. Sin embargo, podemos compartir su
              información en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Con proveedores de servicios que nos ayudan a operar nuestra plataforma.</li>
              <li>Para cumplir con obligaciones legales.</li>
              <li>Para proteger los derechos, la propiedad o la seguridad de HuellaFiel, nuestros usuarios u otros.</li>
              <li>En relación con una fusión, venta de activos o adquisición.</li>
              <li>Con su consentimiento o según sus instrucciones.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no
              autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet
              o almacenamiento electrónico es 100% seguro.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Sus Derechos</h2>
            <p>
              Dependiendo de su ubicación, puede tener ciertos derechos con respecto a sus datos personales, incluyendo:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Acceder a los datos personales que tenemos sobre usted.</li>
              <li>Corregir datos inexactos o incompletos.</li>
              <li>Eliminar sus datos personales.</li>
              <li>Restringir u oponerse al procesamiento de sus datos.</li>
              <li>Solicitar la portabilidad de sus datos.</li>
              <li>Retirar su consentimiento en cualquier momento.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio
              publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última
              actualización".
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contacto</h2>
            <p>
              Si tiene preguntas o inquietudes sobre esta Política de Privacidad, por favor contáctenos a través de
              privacidad@huellafiel.com.ar
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

