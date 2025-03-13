"use client"

import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, Search, Loader2, AlertTriangle, Info, Filter, ImageIcon } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FindPetFormProps {
  userId: string
}

interface PetResult {
  id: string
  name: string
  species: string
  breed?: string
  color?: string
  photo_url?: string
  matchPercentage?: number
  explanation?: string
  matchReasons?: string[]
  visualSimilarity?: number
  originalData?: any
}

export default function FindPetForm({ userId }: FindPetFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [results, setResults] = useState<PetResult[]>([])
  const [recognitionResult, setRecognitionResult] = useState<any>(null)
  const [searchProgress, setSearchProgress] = useState(0)
  const [sortBy, setSortBy] = useState<"match" | "name" | "visual">("match")
  const [searchMethod, setSearchMethod] = useState<"standard" | "visualComparison">("standard")
  const imageRef = useRef<HTMLImageElement>(null)
  const [candidatePhotos, setCandidatePhotos] = useState<{petId: string, photos: string[]}[]>([])
  const [visualComparisonInProgress, setVisualComparisonInProgress] = useState(false)
  const [visualComparisonProgress, setVisualComparisonProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setSelectedFile(file)

    // Create URL for preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setResults([])
    setRecognitionResult(null)
    setApiError(null)
    setCandidatePhotos([])
  }

  const handleSearch = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setResults([])
    setApiError(null)
    setSearchProgress(10)

    try {
      // 1. Upload the image to Supabase for storage
      setSearchProgress(20)
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `search/${userId}_${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pet_search")
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError
      setSearchProgress(40)

      // 2. Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage.from("pet_search").getPublicUrl(fileName)

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image")
      }
      setSearchProgress(50)

      // 3. Call our image recognition API with the image URL
      const response = await fetch("/api/image-recognition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: urlData.publicUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error calling image recognition API")
      }
      setSearchProgress(80)

      const analysisResult = await response.json()
      console.log("API Response:", analysisResult)

      // Store the pet characteristics
      setRecognitionResult({
        species: analysisResult.species,
        breed: analysisResult.breed,
        color: analysisResult.color,
        description: analysisResult.description,
      })
      setSearchProgress(90)

      // Process similar pets if available
      if (analysisResult.similarPets && analysisResult.similarPets.length > 0) {
        // Transform the similar pets data to match our UI format
        const formattedResults = analysisResult.similarPets.map((pet: any) => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          color: pet.color,
          photo_url: pet.main_photo_url,
          // Use the matchScore from the API
          matchPercentage: pet.matchScore,
          // Use the matchReasons from the API to generate explanation
          explanation:
            pet.matchReasons && pet.matchReasons.length > 0
              ? `Coincidencia por ${pet.matchReasons.join(", ")}`
              : generateExplanation(analysisResult, pet),
          // Keep the original data for debugging
          originalData: pet,
        }))

        // Sort by match percentage
        formattedResults.sort((a: PetResult, b: PetResult) => (b.matchPercentage || 0) - (a.matchPercentage || 0))

        setResults(formattedResults)
        
        // Fetch all photos for visual comparison
        if (searchMethod === "visualComparison") {
          fetchCandidatePhotos(formattedResults)
        }
      } else {
        // No similar pets found
        setResults([])
      }
      setSearchProgress(100)

      toast({
        title: "Análisis completado",
        description:
          analysisResult.similarPets && analysisResult.similarPets.length > 0
            ? `Se encontraron ${analysisResult.similarPets.length} mascotas similares`
            : "No se encontraron mascotas similares en la base de datos",
      })
    } catch (error: any) {
      console.error("Error en la búsqueda:", error)
      setApiError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch candidate photos for visual comparison
  const fetchCandidatePhotos = async (pets: PetResult[]) => {
    setVisualComparisonInProgress(true)
    setVisualComparisonProgress(10)
    
    try {
      const photoPromises = pets.map(async (pet) => {
        const { data, error } = await supabase
          .from("pet_photos")
          .select("photo_url")
          .eq("pet_id", pet.id)
        
        if (error) throw error
        
        return {
          petId: pet.id,
          photos: data.map((photo: any) => photo.photo_url).filter(Boolean)
        }
      })
      
      setVisualComparisonProgress(30)
      const allPetPhotos = await Promise.all(photoPromises)
      setCandidatePhotos(allPetPhotos.filter(item => item.photos.length > 0))
      setVisualComparisonProgress(50)
      
      // Now send all these photos plus the search photo to the AI for comparison
      if (preview && allPetPhotos.some(pet => pet.photos.length > 0)) {
        await compareImagesWithAI(preview, allPetPhotos, pets)
      }
      
    } catch (error: any) {
      console.error("Error fetching candidate photos:", error)
      toast({
        title: "Error en comparación visual",
        description: "No se pudieron obtener las fotos para comparación",
        variant: "destructive",
      })
    } finally {
      setVisualComparisonInProgress(false)
      setVisualComparisonProgress(100)
    }
  }
  
  // Function to send images to AI for comparison
  const compareImagesWithAI = async (
    searchImageUrl: string, 
    candidatePhotos: {petId: string, photos: string[]}[],
    existingResults: PetResult[]
  ) => {
    try {
      setVisualComparisonProgress(60)
      
      // Prepare the payload for the AI service
      const payload = {
        searchImage: searchImageUrl,
        candidateImages: candidatePhotos.flatMap(pet => 
          pet.photos.map(photo => ({
            petId: pet.petId,
            imageUrl: photo
          }))
        )
      }
      
      // Call the AI service for visual comparison
      const response = await fetch("/api/compare-pet-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error en el servicio de comparación de imágenes")
      }
      
      setVisualComparisonProgress(80)
      
      const comparisonResults = await response.json()
      console.log("Image comparison results:", comparisonResults)
      
      // Update the existing results with visual similarity scores
      const updatedResults = existingResults.map(pet => {
        // Find the best visual match score for this pet
        const petVisualMatches = comparisonResults.comparisons.filter(
          (match: any) => match.petId === pet.id
        )
        
        const bestVisualMatch = petVisualMatches.length > 0
          ? Math.max(...petVisualMatches.map((match: any) => match.similarityScore))
          : 0
          
        return {
          ...pet,
          visualSimilarity: bestVisualMatch,
          // Update explanation to include visual similarity if significant
          explanation: bestVisualMatch > 70 
            ? `${pet.explanation || ''} + Alta similitud visual (${bestVisualMatch.toFixed(1)}%)`
            : pet.explanation
        }
      })
      
      setResults(updatedResults)
      
      toast({
        title: "Comparación visual completada",
        description: "Se ha actualizado el ranking de mascotas basado en similitud visual",
      })
      
    } catch (error: any) {
      console.error("Error in AI image comparison:", error)
      toast({
        title: "Error en comparación visual",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Generate explanation for the match
  const generateExplanation = (detected: any, dbPet: any): string => {
    // If the pet has matchReasons from the API, use those
    if (dbPet.matchReasons && dbPet.matchReasons.length > 0) {
      return `Coincidencia por ${dbPet.matchReasons.join(", ")}`
    }

    // Otherwise generate explanation here (fallback)
    const factors = []

    if (detected.species && dbPet.species && detected.species.toLowerCase() === dbPet.species.toLowerCase()) {
      factors.push(`misma especie (${dbPet.species})`)
    }

    if (
      detected.breed &&
      dbPet.breed &&
      (detected.breed.toLowerCase() === dbPet.breed.toLowerCase() ||
        dbPet.breed.toLowerCase().includes(detected.breed.toLowerCase()))
    ) {
      factors.push(`raza similar (${dbPet.breed})`)
    }

    if (
      detected.color &&
      dbPet.color &&
      (detected.color.toLowerCase() === dbPet.color.toLowerCase() ||
        dbPet.color.toLowerCase().includes(detected.color.toLowerCase()))
    ) {
      factors.push(`color similar (${dbPet.color})`)
    }

    if (factors.length > 0) {
      return `Coincidencia por ${factors.join(", ")}`
    }

    return "Posible coincidencia basada en características generales"
  }

  // Sort results based on selected criteria
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "match") {
      return (b.matchPercentage || 0) - (a.matchPercentage || 0)
    } else if (sortBy === "visual" && a.visualSimilarity !== undefined && b.visualSimilarity !== undefined) {
      return b.visualSimilarity - a.visualSimilarity
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  // Get match quality class based on percentage
  const getMatchQualityClass = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800"
    if (percentage >= 60) return "bg-primary/10 text-primary"
    return "bg-orange-100 text-orange-800"
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {apiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error en el servicio de reconocimiento</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="standard" onValueChange={(value) => setSearchMethod(value as "standard" | "visualComparison")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Búsqueda Estándar</TabsTrigger>
            <TabsTrigger value="visualComparison">Comparación Visual</TabsTrigger>
          </TabsList>
          <TabsContent value="standard" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              La búsqueda estándar analiza características como especie, raza y color para encontrar mascotas similares.
            </p>
          </TabsContent>
          <TabsContent value="visualComparison" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              La comparación visual utiliza IA para comparar directamente la apariencia de las mascotas en las fotos y obtener mejores resultados.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col items-center justify-center">
          {preview ? (
            <div className="relative w-full max-w-md aspect-square rounded-md overflow-hidden border mb-4">
              <img
                ref={imageRef}
                src={preview || "/placeholder.svg"}
                alt="Vista previa"
                className="object-cover w-full h-full"
                crossOrigin="anonymous"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute bottom-4 right-4"
                onClick={() => {
                  URL.revokeObjectURL(preview)
                  setPreview(null)
                  setSelectedFile(null)
                  setResults([])
                  setRecognitionResult(null)
                  setApiError(null)
                }}
              >
                Cambiar Imagen
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-md aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors mb-4">
              <div className="flex flex-col items-center justify-center p-4">
                <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
                <span className="text-lg font-medium mb-1">Subir Imagen</span>
                <span className="text-sm text-muted-foreground text-center">
                  Sube una foto de la mascota que quieres buscar
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <Button type="button" onClick={handleSearch} disabled={!selectedFile || isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizando imagen...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar {searchMethod === "visualComparison" ? "con comparación visual" : "con IA"}
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Procesando</span>
              <span>{searchProgress}%</span>
            </div>
            <Progress value={searchProgress} className="h-2" />
          </div>
        )}

        {visualComparisonInProgress && (
          <div className="space-y-2 max-w-md mx-auto mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Comparación visual</span>
              <span>{visualComparisonProgress}%</span>
            </div>
            <Progress value={visualComparisonProgress} className="h-2" />
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
          {searchMethod === "visualComparison" 
            ? "La comparación visual analiza directamente las imágenes de las mascotas para encontrar similitudes visuales."
            : "Nuestro sistema de reconocimiento de imágenes analizará la foto y buscará mascotas similares en nuestra base de datos."}
        </p>
      </div>

      {recognitionResult && (
        <div className="space-y-2 p-4 border rounded-md max-w-md mx-auto bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Análisis de la imagen:</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Especie:</span>{" "}
              <span className="font-medium capitalize">{recognitionResult.species || "No detectada"}</span>
            </div>
            {recognitionResult.breed && (
              <div>
                <span className="text-muted-foreground">Raza:</span>{" "}
                <span className="font-medium">{recognitionResult.breed}</span>
              </div>
            )}
            {recognitionResult.color && (
              <div>
                <span className="text-muted-foreground">Color:</span>{" "}
                <span className="font-medium">{recognitionResult.color}</span>
              </div>
            )}
            {recognitionResult.description && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Descripción:</span>{" "}
                <span className="font-medium">{recognitionResult.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Resultados de la Búsqueda ({results.length})</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortBy("match")} className={sortBy === "match" ? "bg-muted" : ""}>
                    Coincidencia por características
                  </DropdownMenuItem>
                  {searchMethod === "visualComparison" && (
                    <DropdownMenuItem onClick={() => setSortBy("visual")} className={sortBy === "visual" ? "bg-muted" : ""}>
                      Similitud visual
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setSortBy("name")} className={sortBy === "name" ? "bg-muted" : ""}>
                    Nombre
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {sortedResults.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border">
                        <img
                          src={pet.photo_url || "/placeholder.svg?height=64&width=64"}
                          alt={pet.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{pet.name}</h4>
                          <div className="flex flex-col items-end">
                            {pet.matchPercentage && (
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${getMatchQualityClass(pet.matchPercentage)}`}
                              >
                                {pet.matchPercentage}% coincidencia
                              </span>
                            )}
                            {pet.visualSimilarity !== undefined && (
                              <span
                                className={`text-xs font-medium px-2 py-1 mt-1 rounded-full ${getMatchQualityClass(pet.visualSimilarity)}`}
                              >
                                <ImageIcon className="h-3 w-3 inline-block mr-1" />
                                {pet.visualSimilarity.toFixed(1)}% visual
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pet.species && (
                            <Badge variant="outline" className="text-xs">
                              {pet.species}
                            </Badge>
                          )}
                          {pet.breed && (
                            <Badge variant="outline" className="text-xs">
                              {pet.breed}
                            </Badge>
                          )}
                          {pet.color && (
                            <Badge variant="outline" className="text-xs">
                              {pet.color}
                            </Badge>
                          )}
                        </div>
                        {pet.explanation && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 hover:line-clamp-none">
                            {pet.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recognitionResult && results.length === 0 && !isLoading && (
        <Alert>
          <AlertTitle>No se encontraron coincidencias</AlertTitle>
          <AlertDescription>
            No hemos encontrado mascotas que coincidan con las características detectadas. Intenta con otra foto o
            modifica los criterios de búsqueda.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}