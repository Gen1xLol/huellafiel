"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { PetPhoto } from "@/types/pet"
import { Trash2, Upload } from "lucide-react"

interface PhotoUploaderProps {
  existingPhotos: PetPhoto[]
  onPhotosSelected: (photos: File[]) => void
  onDeletePhoto: (photoId: string) => void
}

export default function PhotoUploader({ existingPhotos, onPhotosSelected, onDeletePhoto }: PhotoUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    setSelectedFiles([...selectedFiles, ...newFiles])

    // Crear URLs para las previsualizaciones
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews([...previews, ...newPreviews])

    onPhotosSelected([...selectedFiles, ...newFiles])
  }

  const removeSelectedPhoto = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)

    onPhotosSelected(newFiles)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {existingPhotos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border">
            <img
              src={photo.photo_url || "/placeholder.svg"}
              alt="Foto de mascota"
              className="object-cover w-full h-full"
              crossOrigin="anonymous"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => onDeletePhoto(photo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {photo.is_main && (
              <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-xs py-1 text-center">
                Foto Principal
              </div>
            )}
          </div>
        ))}

        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
            <img
              src={preview || "/placeholder.svg"}
              alt={`Vista previa ${index + 1}`}
              className="object-cover w-full h-full"
              crossOrigin="anonymous"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => removeSelectedPhoto(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center p-4">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">Subir Foto</span>
          </div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        Puedes subir múltiples fotos de tu mascota. La primera foto será la principal.
      </p>
    </div>
  )
}

