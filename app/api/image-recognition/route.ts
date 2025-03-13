import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import {
  SPECIES_OPTIONS,
  DOG_BREEDS,
  CAT_BREEDS,
  BIRD_BREEDS,
  OTHER_BREEDS,
  PET_COLORS,
} from "../../../utils/pet-options"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to fetch and compress an image if needed
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

// Get breed options based on species
function getBreedsBySpecies(species: string) {
  switch (species) {
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

// Find the closest match from available options
function findClosestMatch(input: string, options: Array<{ value: string; label: string }>) {
  if (!input) return options[0].value

  input = input.toLowerCase()
  // First try direct match with value
  const directMatch = options.find((option) => option.value.toLowerCase() === input)
  if (directMatch) return directMatch.value

  // Then try partial match
  const partialMatch = options.find(
    (option) =>
      option.value.toLowerCase().includes(input) ||
      input.includes(option.value.toLowerCase()) ||
      option.label.toLowerCase().includes(input) ||
      input.includes(option.label.toLowerCase()),
  )
  if (partialMatch) return partialMatch.value

  // Default to first option if no match found
  return options[0].value
}

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const data = await req.json()
    const { imageUrl } = data

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Compress image if needed
    let processedImageUrl
    try {
      processedImageUrl = await compressImageIfNeeded(imageUrl)
    } catch (error) {
      console.error("Image compression error:", error)
      return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }

    // Create a string representation of the available options to include in the prompt
    const speciesOptionsStr = SPECIES_OPTIONS.map((s) => s.value).join(", ")
    const colorOptionsStr = PET_COLORS.map((c) => c.value).join(", ")

    // Prepare the prompt for the AI (in Spanish)
    const prompt = `
  Eres un experto en identificación de mascotas. Analiza la siguiente imagen de mascota y proporciona información detallada.
  
  Para la imagen de mascota proporcionada, identifica los siguientes atributos:
  1. Especie (IMPORTANTE: debes elegir SOLAMENTE UNA de estas opciones: ${speciesOptionsStr})
  2. Raza (sé específico si es posible, o "mestizo" si no está claro)
  3. Color (IMPORTANTE: debes elegir SOLAMENTE UNO de estos valores: ${colorOptionsStr})
  4. Una breve descripción única destacando cualquier característica distintiva

  Formatea tu respuesta estrictamente como un objeto JSON con la siguiente estructura:
  {
    "species": "la especie identificada (usando SOLO los valores permitidos)",
    "breed": "la raza identificada",
    "color": "el color identificado (usando SOLO los valores permitidos)",
    "description": "una breve descripción única de características distintivas"
  }
  
  Devuelve SOLO el objeto JSON, sin texto o explicaciones adicionales.
  `

    // Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Pet Identification App",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: processedImageUrl } },
            ],
          },
        ],
      }),
    })

    if (!openRouterResponse.ok) {
      const errorDetails = await openRouterResponse.text()
      console.error("OpenRouter API error:", errorDetails)
      return NextResponse.json({ error: "Error calling AI service" }, { status: 500 })
    }

    const aiResult = await openRouterResponse.json()
    console.log("AI Response:", aiResult)
    const aiContent = aiResult.choices[0].message.content

    // Parse the AI response
    let petInfo
    try {
      petInfo = JSON.parse(aiContent)

      // Normalize values to lowercase for better matching
      petInfo.species = petInfo.species.toLowerCase()
      petInfo.breed = petInfo.breed.toLowerCase()
      petInfo.color = petInfo.color.toLowerCase()

      // Get breed options based on species and validate breed
      const breedOptions = getBreedsBySpecies(petInfo.species)
      petInfo.breed = findClosestMatch(petInfo.breed, breedOptions).toLowerCase()
    } catch (e) {
      console.error("Error parsing AI response:", e)
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 })
    }

    console.log("Processed pet info:", petInfo)

    // Search for similar pets in the database using text search
    try {
      // Construir los términos de búsqueda correctamente para tsquery
const searchTerms = `${petInfo.species} & ${petInfo.breed} & ${petInfo.color}`.toLowerCase();

// Opción 1: Usar el operador & para AND entre términos
const { data: textSearchMatches, error: searchError } = await supabase
  .from("pets")
  .select("*")
  .textSearch("species", petInfo.species);

      if (searchError) {
        console.error("Text search error:", searchError)
        // Fallback a la búsqueda básica si hay error
        const { data: speciesMatches, error: speciesError } = await supabase
          .from("pets")
          .select("*")
          .eq("species", petInfo.species.toLowerCase())

        if (speciesError) {
          console.error("Database query error:", speciesError)
          return NextResponse.json({
            ...petInfo,
            error: "Database query error",
            similarPets: [],
          })
        }

        console.log(`Found ${speciesMatches?.length || 0} pets with matching species (fallback search)`)

        // Score each pet based on attribute similarity
        if (speciesMatches && speciesMatches.length > 0) {
          const scoredPets = speciesMatches.map((pet) => {
            let score = 0
            const matchReasons = []

            // Species match (most important)
            if (pet.species.toLowerCase() === petInfo.species.toLowerCase()) {
              score += 50
              matchReasons.push("especie")
            } else {
              // If species doesn't match, give a very low base score
              score += 10
            }

            // Breed match
            if (pet.breed && petInfo.breed) {
              if (pet.breed.toLowerCase() === petInfo.breed.toLowerCase()) {
                score += 30
                matchReasons.push("raza")
              } else if (
                pet.breed.toLowerCase().includes(petInfo.breed.toLowerCase()) ||
                petInfo.breed.toLowerCase().includes(pet.breed.toLowerCase())
              ) {
                score += 15
                matchReasons.push("raza similar")
              }
            }

            // Color match
            if (pet.color && petInfo.color) {
              if (pet.color.toLowerCase() === petInfo.color.toLowerCase()) {
                score += 20
                matchReasons.push("color")
              } else if (
                pet.color.toLowerCase().includes(petInfo.color.toLowerCase()) ||
                petInfo.color.toLowerCase().includes(pet.color.toLowerCase())
              ) {
                score += 10
                matchReasons.push("color similar")
              }
            }

            // Add some randomness for variety (±5%)
            const randomFactor = Math.floor(Math.random() * 10) - 5
            const finalScore = Math.min(Math.max(score + randomFactor, 10), 95)

            return {
              ...pet,
              matchScore: finalScore,
              matchReasons,
            }
          })

          // Filter pets with a minimum score and sort by score
          const filteredPets = scoredPets
            .filter((pet) => pet.matchScore >= 20) // Minimum threshold
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20) // Limit to top 20 matches

          // Add the scored pets to the response
          petInfo.similarPets = filteredPets
          console.log(
            `Found ${filteredPets.length} potential matches out of ${speciesMatches.length} total pets (fallback search)`,
          )
        } else {
          console.log("No pets found in database (fallback search)")
          petInfo.similarPets = []
        }
      } else {
        // Process text search results
        console.log(`Found ${textSearchMatches?.length || 0} pets with text search`)

        if (textSearchMatches && textSearchMatches.length > 0) {
          // Score each pet based on text search relevance and add match reasons
          const scoredPets = textSearchMatches.map((pet, index) => {
            // Calculate a score based on position in results (first results are more relevant)
            // Score range: 95 (first result) to 40 (last result)
            const positionScore = Math.max(95 - (index * 55) / textSearchMatches.length, 40)

            // Determine match reasons
            const matchReasons = []

            if (pet.species.toLowerCase() === petInfo.species.toLowerCase()) {
              matchReasons.push("especie")
            }

            if (
              pet.breed &&
              petInfo.breed &&
              (pet.breed.toLowerCase() === petInfo.breed.toLowerCase() ||
                pet.breed.toLowerCase().includes(petInfo.breed.toLowerCase()) ||
                petInfo.breed.toLowerCase().includes(pet.breed.toLowerCase()))
            ) {
              matchReasons.push("raza")
            }

            if (
              pet.color &&
              petInfo.color &&
              (pet.color.toLowerCase() === petInfo.color.toLowerCase() ||
                pet.color.toLowerCase().includes(petInfo.color.toLowerCase()) ||
                petInfo.color.toLowerCase().includes(pet.color.toLowerCase()))
            ) {
              matchReasons.push("color")
            }

            // If no specific reasons found, it's a general text match
            if (matchReasons.length === 0) {
              matchReasons.push("características similares")
            }

            return {
              ...pet,
              matchScore: Math.round(positionScore),
              matchReasons,
            }
          })

          // Add the scored pets to the response
          petInfo.similarPets = scoredPets.slice(0, 20) // Limit to top 20 matches
          console.log(`Processed ${scoredPets.length} text search matches`)
        } else {
          console.log("No text search matches found")
          petInfo.similarPets = []
        }
      }

      return NextResponse.json(petInfo)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({
        ...petInfo,
        error: "Database error",
        similarPets: [],
      })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Optional: GET method to check if the service is running
export async function GET() {
  // Check if we can connect to the database
  try {
    const { data, error } = await supabase.from("pets").select("count").limit(1)

    if (error) {
      return NextResponse.json({
        status: "Pet identification service is operational, but database connection failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      status: "Pet identification service is fully operational",
      databaseConnected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: "Pet identification service is operational, but an error occurred",
      error: String(error),
      timestamp: new Date().toISOString(),
    })
  }
}