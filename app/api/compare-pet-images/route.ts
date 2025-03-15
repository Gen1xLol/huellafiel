import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from "@/utils/supabase/server"
import sharp from 'sharp'

interface CompareRequest {
  searchImage: string
  candidateImages: {
    petId: string
    imageUrl: string
  }[]
}

interface ComparisonResult {
  petId: string;
  similarityScore: number;
  confidence: number;
  justification: string;
}

function removeContactKeys(array: ComparisonResult[]): Omit<ComparisonResult, 'justification'>[] {
  // Create a new array to avoid modifying the original
  return array.map(item => {
    // Create a new object to hold the filtered properties
    const filteredItem: Partial<ComparisonResult> = {};
    
    // Loop through all keys in the current item
    for (const key in item) {
      // Only keep keys that don't contain "contact_"
      if (!key.includes("contact_")) {
        filteredItem[key as keyof ComparisonResult] = item[key as keyof ComparisonResult];
      }
    }
    
    return filteredItem as Omit<ComparisonResult, 'justification'>;
  });
}

// Function to compress an image if needed - reused from the provided example
async function compressImageIfNeeded(imageUrl: string): Promise<string> {
  // Fetch the image
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  // Check file size (1MB = 1048576 bytes)
  if (buffer.length <= 1048576) {
    return imageUrl // Return original URL if image is already small enough
  }

  // Compress the image
  const compressedBuffer = await sharp(buffer)
    .resize(800) // Resize to width of 800px (height auto-calculated to maintain aspect ratio)
    .jpeg({ quality: 80 }) // Use JPEG format with 80% quality
    .toBuffer()

  // Convert compressed buffer to base64 for direct use in API
  const base64Image = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`
  return base64Image
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Parse the request body
    const body: CompareRequest = await request.json()
    
    // Validate input
    if (!body.searchImage || !body.candidateImages || body.candidateImages.length === 0) {
      return NextResponse.json({ error: "Datos incompletos para la comparación" }, { status: 400 })
    }

    // Maximum number of images to compare (to prevent overwhelming the AI service)
    const MAX_IMAGES = 10
    const candidateImages = body.candidateImages.slice(0, MAX_IMAGES)

    // Process and compress the search image
    let processedSearchImage
    try {
      processedSearchImage = await compressImageIfNeeded(body.searchImage)
    } catch (error) {
      console.error("Image compression error for search image:", error)
      return NextResponse.json({ error: "Error al procesar la imagen de búsqueda" }, { status: 500 })
    }

    // Process and compress candidate images
    const processedCandidateImages = await Promise.all(
      candidateImages.map(async (img) => {
        try {
          const processedUrl = await compressImageIfNeeded(img.imageUrl)
          return {
            petId: img.petId,
            processedUrl
          }
        } catch (error) {
          console.error(`Image compression error for pet ID ${img.petId}:`, error)
          return {
            petId: img.petId,
            processedUrl: img.imageUrl // Fallback to original URL if compression fails
          }
        }
      })
    )

    // Prepare the prompt for image comparison
    const prompt = `
Eres un experto en comparación de imágenes de mascotas. Tu tarea es comparar una imagen de referencia con varias imágenes candidatas y determinar si muestran al mismo animal.

La primera imagen es la imagen de referencia de una mascota perdida o encontrada.
Las siguientes ${processedCandidateImages.length} imágenes son candidatas para comparar.

Para cada imagen candidata, proporciona:
1. Un porcentaje de similitud (0-100%) que representa cuán probable es que muestre al mismo animal
2. Un nivel de confianza (0-1) para tu evaluación
3. Una breve justificación de tu evaluación basada en características físicas específicas

Analiza detalles como:
- Patrones de pelaje/plumaje y color
- Marcas distintivas o características físicas únicas
- Forma del cuerpo, tamaño y proporciones
- Características faciales como forma de ojos, nariz, etc.
- Ten en cuenta que la iluminación, ángulo y calidad de la imagen pueden variar

Formatea tu respuesta estrictamente como un objeto JSON con la siguiente estructura:
{
  "comparisons": [
    {
      "petId": "ID de la primera mascota candidata",
      "similarityScore": número entre 0 y 100,
      "confidence": número entre 0 y 1,
      "justification": "breve explicación"
    },
    {
      "petId": "ID de la segunda mascota candidata",
      ...
    }
    ...
  ]
}

Devuelve SOLO el objeto JSON, sin texto o explicaciones adicionales.
`

    // Create a messages array for the OpenRouter API
    // First comes the user prompt text
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt }
        ]
      }
    ]

    // Then add the reference (search) image
    messages[0].content.push({ 
      type: "image_url", 
      image_url: { url: processedSearchImage } 
    })

    // Then add each candidate image
    processedCandidateImages.forEach(img => {
      messages[0].content.push({
        type: "image_url",
        image_url: { url: img.processedUrl }
      })
    })

    // Add a final message with the pet IDs to ensure the AI can reference them correctly
    const petIdsMessage = "Pet IDs in order: " + processedCandidateImages.map(img => img.petId).join(", ")
    messages[0].content.push({ type: "text", text: petIdsMessage })

    // Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_KEY}`,
        "HTTP-Referer": "https://huellafiel.com.ar",
        "X-Title": "HuellaFiel",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: messages,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorDetails = await openRouterResponse.text()
      console.error("OpenRouter API error:", errorDetails)
      return NextResponse.json({ error: "Error al llamar al servicio de IA" }, { status: 500 })
    }

    const aiResult = await openRouterResponse.json()
    console.log("AI Response received")
    const aiContent = aiResult.choices[0].message.content

    // Parse the AI response
    let comparisonResults
    try {
      comparisonResults = JSON.parse(aiContent)
      
      // Validate structure and ensure petIds match the original input
      const validPetIds = new Set(candidateImages.map(img => img.petId))
      
      comparisonResults.comparisons = comparisonResults.comparisons
        .filter(comp => validPetIds.has(comp.petId))
        .map(comp => ({
          ...comp,
          // Ensure values are in the right ranges
          similarityScore: Math.min(Math.max(Number(comp.similarityScore), 0), 100),
          confidence: Math.min(Math.max(Number(comp.confidence), 0), 1)
        }))
    } catch (e) {
      console.error("Error parsing AI response:", e)
      return NextResponse.json({ error: "Formato de respuesta de IA inválido" }, { status: 500 })
    }

    let final = removeContactKeys(comparisonResults.comparisons)

    // Return results
    return NextResponse.json(final)
  } catch (error) {
    console.error('Error in image comparison API:', error)
    return NextResponse.json(
      { error: "Error procesando la solicitud de comparación de imágenes" },
      { status: 500 }
    )
  }
}