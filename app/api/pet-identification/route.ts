import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import {
  SPECIES_OPTIONS,
  DOG_BREEDS,
  CAT_BREEDS,
  BIRD_BREEDS,
  OTHER_BREEDS,
  PET_COLORS,
} from "@/utils/pet-options"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
  5. Debes basar tu respuesta en la realidad y no en la ficción

  posdata: para animales con pelo carey o calico deberas elegir "tricolor" SIEMPRE.
  ejemplo extra: si hay un gato al cual solo se le ven dos colores en la imagen (negro y marrón) 
  pero sospechas que es carey o calico igual, deberas elegir "tricolor" en vez de "atigrado".

  Formatea tu respuesta estrictamente como un objeto JSON con la siguiente estructura:
  {
    "species": "la especie identificada (usando SOLO los valores permitidos)",
    "breed": "la raza identificada",
    "color": "el color identificado (usando SOLO los valores permitidos)",
    "description": "una breve descripción única de características distintivas",
    "confidence": 0.85
  }
  
  Incluye un valor de confianza entre 0 y 1, donde 1 es máxima confianza.
  Devuelve SOLO el objeto JSON, sin texto o explicaciones adicionales.
  `

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
        model: "google/gemma-3-12b-it:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
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
    return NextResponse.json(petInfo)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Optional: GET method to check if the service is running
export async function GET() {
  return NextResponse.json({
    status: "Pet identification service is operational",
    timestamp: new Date().toISOString(),
  })
}