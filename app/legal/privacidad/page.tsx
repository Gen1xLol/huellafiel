import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrintIcon as Paw, ArrowLeft, Mail, Shield, Bell, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PoliticaPrivacidad() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="px-4 lg:px-6 h-16 flex items-center backdrop-blur-sm bg-background/80 sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center">
          <Paw className="h-6 w-6 text-primary mr-2" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            HuellaFiel
          </span>
        </Link>
        <nav className="ml-auto flex gap-4">
          <Link href="/contacto">
            <Button variant="ghost" size="sm">Contacto</Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" size="sm">FAQ</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Button>
          </Link>

          <div className="mb-8 space-y-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Política de Privacidad</h1>
            <p className="text-muted-foreground">Última actualización: 10 de marzo de 2025</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Resumen de privacidad</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              En HuellaFiel nos comprometemos a:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                <span className="text-sm">No vender ni alquilar sus datos personales</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                <span className="text-sm">Proteger su información con cifrado avanzado</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                <span className="text-sm">Ofrecer control total sobre sus datos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                <span className="text-sm">Ser transparentes sobre el uso de la información</span>
              </li>
            </ul>
          </div>

          <div className="prose prose-green max-w-none">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  1. Introducción
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    En HuellaFiel, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política
                    de Privacidad describe cómo recopilamos, utilizamos y compartimos su información cuando utiliza nuestra
                    plataforma diseñada para ayudar a reunir mascotas perdidas con sus dueños.
                  </p>
                  <p>
                    Al utilizar nuestra plataforma, usted acepta las prácticas descritas en esta política. Le recomendamos
                    leerla detenidamente para entender cómo tratamos su información.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  2. Información que Recopilamos
                </AccordionTrigger>
                <AccordionContent>
                  <p>Recopilamos varios tipos de información, incluyendo:</p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>
                      <strong className="text-primary">Información de registro:</strong> Cuando crea una cuenta, recopilamos su nombre, dirección de
                      correo electrónico y contraseña.
                    </li>
                    <li>
                      <strong className="text-primary">Información de perfil:</strong> Información sobre sus mascotas, incluyendo nombre, especie,
                      raza, edad, color y fotos.
                    </li>
                    <li>
                      <strong className="text-primary">Información de contacto:</strong> Datos de contacto que proporciona para cada mascota.
                    </li>
                    <li>
                      <strong className="text-primary">Información de uso:</strong> Datos sobre cómo interactúa con nuestra plataforma, incluyendo
                      búsquedas y visualizaciones de perfiles.
                    </li>
                    <li>
                      <strong className="text-primary">Información del dispositivo:</strong> Datos técnicos como su dirección IP, tipo de navegador y
                      sistema operativo.
                    </li>
                    <li>
                      <strong className="text-primary">Datos de geolocalización:</strong> Con su permiso, podemos recopilar datos de ubicación precisos para
                      ayudar a encontrar mascotas perdidas en su área.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  3. Cómo Utilizamos su Información
                </AccordionTrigger>
                <AccordionContent>
                  <p>Utilizamos la información recopilada para:</p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>Proporcionar, mantener y mejorar nuestros servicios de reunificación de mascotas.</li>
                    <li>Procesar y completar transacciones relacionadas con suscripciones premium o servicios adicionales.</li>
                    <li>Enviar notificaciones sobre mascotas perdidas o encontradas en su área.</li>
                    <li>Enviar información técnica, actualizaciones y mensajes de soporte.</li>
                    <li>Responder a sus comentarios y preguntas sobre el servicio.</li>
                    <li>Desarrollar nuevas funcionalidades para mejorar las probabilidades de reencontrar mascotas perdidas.</li>
                    <li>Monitorear y analizar tendencias, uso y actividades para optimizar la plataforma.</li>
                    <li>Detectar, investigar y prevenir actividades fraudulentas y no autorizadas.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  4. Compartir su Información
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    No vendemos ni alquilamos su información personal a terceros. Sin embargo, podemos compartir su
                    información en las siguientes circunstancias:
                  </p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>Con otros usuarios de la plataforma únicamente cuando sea necesario para facilitar el reencuentro de mascotas perdidas.</li>
                    <li>Con proveedores de servicios que nos ayudan a operar nuestra plataforma (como servicios de almacenamiento en la nube o procesamiento de pagos).</li>
                    <li>Para cumplir con obligaciones legales o responder a procesos legales.</li>
                    <li>Para proteger los derechos, la propiedad o la seguridad de HuellaFiel, nuestros usuarios u otros.</li>
                    <li>En relación con una fusión, venta de activos o adquisición de nuestra empresa.</li>
                    <li>Con su consentimiento explícito o según sus instrucciones específicas.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  5. Seguridad de los Datos
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger su información personal:
                  </p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>Utilizamos encriptación SSL/TLS para todas las transmisiones de datos.</li>
                    <li>Almacenamos contraseñas utilizando algoritmos de hash seguros.</li>
                    <li>Implementamos controles de acceso estrictos para los empleados.</li>
                    <li>Realizamos auditorías de seguridad periódicas.</li>
                    <li>Mantenemos planes de respuesta a incidentes actualizados.</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Nota: Aunque implementamos medidas de seguridad robustas, ningún método de transmisión por Internet
                    o almacenamiento electrónico es 100% seguro. No podemos garantizar la seguridad absoluta de sus datos.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  6. Sus Derechos
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Dependiendo de su ubicación, puede tener ciertos derechos con respecto a sus datos personales:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 my-4">
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Derecho de acceso</h4>
                      <p className="text-sm text-muted-foreground">Solicitar una copia de los datos personales que tenemos sobre usted.</p>
                    </div>
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Derecho de rectificación</h4>
                      <p className="text-sm text-muted-foreground">Corregir datos inexactos o incompletos en su cuenta.</p>
                    </div>
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Derecho de supresión</h4>
                      <p className="text-sm text-muted-foreground">Eliminar sus datos personales de nuestros sistemas.</p>
                    </div>
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Derecho de oposición</h4>
                      <p className="text-sm text-muted-foreground">Oponerse al procesamiento de sus datos para ciertos fines.</p>
                    </div>
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Derecho a la portabilidad</h4>
                      <p className="text-sm text-muted-foreground">Recibir sus datos en un formato estructurado y legible.</p>
                    </div>
                    <div className="bg-card rounded-md p-3 border">
                      <h4 className="font-medium mb-2">Retirar consentimiento</h4>
                      <p className="text-sm text-muted-foreground">Revocar su permiso para ciertos procesamientos de datos.</p>
                    </div>
                  </div>
                  <p>
                    Para ejercer cualquiera de estos derechos, por favor envíe una solicitud a través de nuestro{" "}
                    <Link href="/centro-privacidad" className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/100 transition-all">
                      Centro de Privacidad
                    </Link>{" "}
                    o contáctenos directamente a privacidad@huellafiel.com.ar
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  7. Cambios a esta Política
                </AccordionTrigger>
                <AccordionContent>
                <p>
                    Podemos actualizar esta Política de Privacidad de vez en cuando para reflejar cambios en nuestras prácticas o por otros motivos operativos, legales o regulatorios.
                  </p>
                  <p className="mt-3">
                    Cuando realicemos cambios materiales a esta política:
                  </p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>Le notificaremos publicando la nueva versión en nuestra plataforma.</li>
                    <li>Actualizaremos la fecha de "última actualización" al principio de esta página.</li>
                    <li>Le enviaremos una notificación por correo electrónico si los cambios afectan significativamente el procesamiento de sus datos personales.</li>
                    <li>En algunos casos, solicitaremos su consentimiento antes de aplicar los nuevos términos.</li>
                  </ul>
                  <p>
                    Le recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos su información.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  8. Contacto
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos a través de los siguientes medios:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 my-6">
                    <div className="flex items-start gap-3 bg-card p-4 rounded-lg border">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Correo electrónico</h4>
                        <a href="mailto:privacidad@huellafiel.com.ar" className="text-sm text-primary hover:underline">
                          privacidad@huellafiel.com.ar
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-card p-4 rounded-lg border">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Delegado de Protección de Datos</h4>
                        <a href="mailto:dpo@huellafiel.com.ar" className="text-sm text-primary hover:underline">
                          dpo@huellafiel.com.ar
                        </a>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  9. Cookies y Tecnologías Similares
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el tráfico y personalizar el contenido.
                  </p>
                  <p className="mt-3">Tipos de cookies que utilizamos:</p>
                  <ul className="list-disc pl-6 my-4 space-y-3">
                    <li>
                      <strong className="text-primary">Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio. Ejemplo: autenticación.
                    </li>
                    <li>
                      <strong className="text-primary">Cookies analíticas:</strong> Nos ayudan a entender cómo interactúan los usuarios con el sitio. Ejemplo: Google Analytics.
                    </li>
                    <li>
                      <strong className="text-primary">Cookies funcionales:</strong> Permiten recordar sus preferencias y opciones. Ejemplo: idioma.
                    </li>
                    <li>
                      <strong className="text-primary">Cookies de terceros:</strong> Colocadas por servicios externos que utilizamos. Ejemplo: redes sociales.
                    </li>
                  </ul>
                  <p>
                    Puede gestionar sus preferencias de cookies a través de nuestro{" "}
                    <Button variant="link" className="p-0 h-auto text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/100 transition-all">
                      Panel de Preferencias de Cookies
                    </Button>.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-colors">
                  10. Transferencias Internacionales de Datos
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    HuellaFiel opera principalmente en Argentina, pero puede transferir, procesar y almacenar información en otros países donde operamos o donde se encuentran nuestros proveedores de servicios.
                  </p>
                  <p className="mt-3">
                    Al utilizar nuestros servicios, usted reconoce que su información puede ser transferida a países con diferentes leyes de protección de datos que las de su país de residencia.
                  </p>
                  <p className="mt-3">
                    Para las transferencias desde Argentina a otros países, implementamos salvaguardas apropiadas, como cláusulas contractuales estándar, para garantizar que sus datos estén protegidos de acuerdo con esta política.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="mt-12 bg-card rounded-lg p-6 shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Manténgase informado
              </h3>
              <p className="text-sm text-muted-foreground">
                Suscríbase para recibir actualizaciones sobre cambios importantes en nuestra política de privacidad.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Su correo electrónico"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="shrink-0">Suscribirse</Button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex gap-6">
              <Link href="/terminos" className="hover:text-primary transition-colors">
                Términos de servicio
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Política de cookies
              </Link>
            </div>
            <div className="flex gap-2 items-center">
              <span>¿Necesita ayuda?</span>
              <Link href="/soporte" className="text-primary hover:underline flex items-center gap-1">
                Centro de soporte
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Paw className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">HuellaFiel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 HuellaFiel. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}