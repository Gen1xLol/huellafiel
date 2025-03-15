"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Pet, PetPhoto } from "@/types/pet"
import { Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"

interface PetProfileProps {
  pet: Pet & { pet_photos: PetPhoto[] }
}

export default function PetProfile({ pet }: PetProfileProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    pet.pet_photos.find((p) => p.is_main)?.photo_url ||
      (pet.pet_photos.length > 0 ? pet.pet_photos[0].photo_url : null),
  )

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Eliminar fotos de la mascota
      const { error: photosError } = await supabase.from("pet_photos").delete().eq("pet_id", pet.id)

      if (photosError) throw photosError

      // Eliminar la mascota
      const { error } = await supabase.from("pets").delete().eq("id", pet.id)

      if (error) throw error

      toast({
        title: "Mascota eliminada",
        description: "La mascota ha sido eliminada exitosamente",
      })

      router.refresh()
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">{pet.name}</CardTitle>
          <div className="flex space-x-2">
            <Link href={`/pets/${pet.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-square rounded-md overflow-hidden border">
              <img
                src={selectedPhoto || "/placeholder.svg?height=400&width=400"}
                alt={pet.name}
                className="object-cover w-full h-full"
              />
            </div>

            {pet.pet_photos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {pet.pet_photos.map((photo) => (
                  <button
                    key={photo.id}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                      selectedPhoto === photo.photo_url ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedPhoto(photo.photo_url)}
                  >
                    <img
                      src={photo.photo_url || "/placeholder.svg"}
                      alt="Foto de mascota"
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Especie</p>
                  <p>{pet.species}</p>
                </div>
                {pet.breed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Raza</p>
                    <p>{pet.breed}</p>
                  </div>
                )}
                {pet.age && (
                  <div>
                    <p className="text-sm text-muted-foreground">Edad</p>
                    <p>{pet.age}</p>
                  </div>
                )}
                {pet.color && (
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p>{pet.color}</p>
                  </div>
                )}
              </div>
            </div>

            {pet.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Descripción</h3>
                <p>{pet.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Información de Contacto</h3>
              <div className="space-y-2">
                <p className="font-medium">{pet.contact_name}</p>

                {pet.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{pet.contact_phone}</p>
                  </div>
                )}

                {pet.contact_email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{pet.contact_email}</p>
                  </div>
                )}

                {pet.contact_address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{pet.contact_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="flex justify-between items-center w-full">
          <Badge variant="outline">{pet.species}</Badge>
          <span className="text-sm text-muted-foreground">
            Registrado el {new Date(pet.created_at).toLocaleDateString("es-AR")}
          </span>
        </div>
      </CardFooter>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar mascota?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la mascota y todas sus fotos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

