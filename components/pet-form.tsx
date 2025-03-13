"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Pet, PetPhoto } from "@/types/pet"
import PhotoUploader from "./photo-uploader"
import { Loader2, Wand2 } from "lucide-react"
import { classifyImage, loadModel } from "@/utils/image-recognition"
import { SPECIES_OPTIONS, DOG_BREEDS, CAT_BREEDS, BIRD_BREEDS, OTHER_BREEDS, PET_COLORS } from "@/utils/pet-options"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PetFormProps {
  userId: string
  pet?: Pet & { pet_photos: PetPhoto[] }
}

export default function PetForm({ userId, pet }: PetFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<PetPhoto[]>(pet?.pet_photos || [])
  const [selectedSpecies, setSelectedSpecies] = useState<string>(pet?.species || "perro")
  const [selectedBreed, setSelectedBreed] = useState<string>(pet?.breed || "")
  const [selectedColor, setSelectedColor] = useState<string>(pet?.color || "")
  const [modelError, setModelError] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [detectionResult, setDetectionResult] = useState<any>(null)

  // Cargar el modelo de TensorFlow.js al montar el componente
  useEffect(() => {
    async function initModel() {
      try {
        setModelLoadingProgress(10)
        // Simular progreso de carga
        const progressInterval = setInterval(() => {
          setModelLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 500)

        await loadModel()
        clearInterval(progressInterval)
        setModelLoadingProgress(100)
        setIsModelLoading(false)
        setModelError(null)
      } catch (error: any) {
        console.error("Error al cargar el modelo:", error)
        setModelError(error.message || "Error desconocido al cargar el modelo")
        setIsModelLoading(false)
        toast({
          title: "Error",
          description: `No se pudo cargar el modelo de reconocimiento: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    initModel()
  }, [toast])

  // Actualizar la URL de vista previa cuando cambian las fotos
  useEffect(() => {
    if (photos.length > 0) {
      const url = URL.createObjectURL(photos[0])
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else if (existingPhotos.length > 0) {
      setPreviewUrl(existingPhotos[0].photo_url)
    } else {
      setPreviewUrl(null)
    }
  }, [photos, existingPhotos])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const petData = {
        name: formData.get("name") as string,
        species: formData.get("species") as string,
        breed: formData.get("breed") as string,
        age: formData.get("age") as string,
        color: formData.get("color") as string,
        description: formData.get("description") as string,
        contact_name: formData.get("contact_name") as string,
        contact_phone: formData.get("contact_phone") as string,
        contact_email: formData.get("contact_email") as string,
        contact_address: formData.get("contact_address") as string,
        user_id: userId,
      }

      let petId = pet?.id

      // Crear o actualizar la mascota
      if (pet) {
        const { error } = await supabase.from("pets").update(petData).eq("id", pet.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase.from("pets").insert(petData).select()

        if (error) throw error
        petId = data[0].id
      }

      // Subir nuevas fotos
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileExt = photo.name.split(".").pop()
          const fileName = `${petId}/${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("pet_photos").upload(fileName, photo)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from("pet_photos").getPublicUrl(fileName)

          await supabase.from("pet_photos").insert({
            pet_id: petId,
            photo_url: urlData.publicUrl,
            is_main: existingPhotos.length === 0 && photos.indexOf(photo) === 0,
          })
        }
      }

      toast({
        title: pet ? "Mascota actualizada" : "Mascota registrada",
        description: pet
          ? "Los datos de la mascota han sido actualizados"
          : "La mascota ha sido registrada exitosamente",
      })

      router.refresh()
      router.push(pet ? `/pets/${pet.id}` : "/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const photoToDelete = existingPhotos.find((p) => p.id === photoId)

      if (!photoToDelete) return

      const { error } = await supabase.from("pet_photos").delete().eq("id", photoId)

      if (error) throw error

      // Actualizar la lista de fotos existentes
      setExistingPhotos(existingPhotos.filter((p) => p.id !== photoId))

      toast({
        title: "Foto eliminada",
        description: "La foto ha sido eliminada exitosamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Obtener las razas disponibles según la especie seleccionada
  const getBreedOptions = () => {
    switch (selectedSpecies) {
      case "perro":
        return DOG_BREEDS
      case "gato":
        return CAT_BREEDS
      case "ave":
        return BIRD_BREEDS
      default:
        return OTHER_BREEDS
    }
  }

  // Función para analizar la imagen y autocompletar los campos
  const analyzeImage = async () => {
    if (!previewUrl) {
      toast({
        title: "No hay imagen para analizar",
        description: "Por favor, sube al menos una foto para usar la detección automática",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setDetectionResult(null)

    try {
      // Crear una imagen temporal para el análisis
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = previewUrl

      await new Promise((resolve) => {
        img.onload = resolve
      })

      const classification = await classifyImage(img)
      console.log("Resultado de la clasificación:", classification)

      // Guardar el resultado para mostrarlo
      setDetectionResult(classification)

      // Aplicar los resultados a los campos del formulario
      applyClassificationResults(classification)
    } catch (error: any) {
      console.error("Error al analizar la imagen:", error)
      toast({
        title: "Error en la detección",
        description: "No se pudo analizar la imagen. " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Aplicar los resultados de la clasificación a los campos del formulario
  const applyClassificationResults = (classification: any) => {
    if (classification.species && classification.species !== "desconocido") {
      setSelectedSpecies(classification.species)
    }

    if (classification.breed) {
      setSelectedBreed(classification.breed)
    }

    if (classification.color) {
      setSelectedColor(classification.color)
    }

    toast({
      title: "Detección completada",
      description: "Se han completado automáticamente algunos campos basados en la imagen",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isModelLoading && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/30">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Cargando modelos de IA avanzados...</p>
              <Progress value={modelLoadingProgress} className="h-2 mt-2" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Estamos cargando modelos de reconocimiento de imágenes más precisos para identificar mejor a tu mascota.
          </p>
        </div>
      )}

      {modelError && (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar el modelo de IA: {modelError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={pet?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="species">Especie</Label>
            <Select
              name="species"
              value={selectedSpecies}
              onValueChange={(value) => {
                setSelectedSpecies(value)
                setSelectedBreed("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una especie" />
              </SelectTrigger>
              <SelectContent>
                {SPECIES_OPTIONS.map((species) => (
                  <SelectItem key={species.value} value={species.value}>
                    {species.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Raza</Label>
            <Select name="breed" value={selectedBreed} onValueChange={setSelectedBreed}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una raza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mestizo">Mestizo</SelectItem>
                {getBreedOptions().map((breed) => (
                  <SelectItem key={breed.value} value={breed.value}>
                    {breed.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Edad</Label>
            <Input id="age" name="age" defaultValue={pet?.age} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select name="color" value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_especificado">Sin especificar</SelectItem>
                {PET_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" defaultValue={pet?.description} rows={3} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Fotos</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={analyzeImage}
            disabled={isModelLoading || isAnalyzing || !previewUrl}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Autodetectar
              </>
            )}
          </Button>
        </div>

        {/* Imagen oculta para referencia del modelo */}
        {previewUrl && (
          <img
            ref={imageRef}
            src={previewUrl || "/placeholder.svg"}
            alt="Referencia para análisis"
            className="hidden"
            crossOrigin="anonymous"
          />
        )}

        <PhotoUploader existingPhotos={existingPhotos} onPhotosSelected={setPhotos} onDeletePhoto={handleDeletePhoto} />

        {detectionResult && (
          <div className="p-4 border rounded-md bg-muted/30 space-y-2">
            <h4 className="font-medium">Resultados de la detección:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Especie:</span>{" "}
                <span className="font-medium capitalize">{detectionResult.species || "No detectada"}</span>
              </div>
              {detectionResult.breed && (
                <div>
                  <span className="text-muted-foreground">Raza:</span>{" "}
                  <span className="font-medium">{detectionResult.breed}</span>
                </div>
              )}
              {detectionResult.color && (
                <div>
                  <span className="text-muted-foreground">Color:</span>{" "}
                  <span className="font-medium">{detectionResult.color}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Confianza:</span>{" "}
                <span className="font-medium">{Math.round(detectionResult.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Nombre del Contacto</Label>
            <Input id="contact_name" name="contact_name" defaultValue={pet?.contact_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Teléfono</Label>
            <Input id="contact_phone" name="contact_phone" defaultValue={pet?.contact_phone} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Correo Electrónico</Label>
            <Input id="contact_email" name="contact_email" type="email" defaultValue={pet?.contact_email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_address">Dirección</Label>
            <Input id="contact_address" name="contact_address" defaultValue={pet?.contact_address} />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (pet ? "Actualizando..." : "Registrando...") : pet ? "Actualizar Mascota" : "Registrar Mascota"}
        </Button>
      </div>
    </form>
  )
}

