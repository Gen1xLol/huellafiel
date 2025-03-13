import * as tf from "@tensorflow/tfjs"
// Importar explícitamente los backends
import "@tensorflow/tfjs-backend-webgl"
import "@tensorflow/tfjs-backend-cpu"
import * as mobilenet from "@tensorflow-models/mobilenet"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import { SPECIES_OPTIONS, DOG_BREEDS, CAT_BREEDS, BIRD_BREEDS, OTHER_BREEDS, PET_COLORS } from "./pet-options"

// Categorías de animales que queremos detectar
const PET_CATEGORIES = [
  "dog",
  "cat",
  "bird",
  "hamster",
  "rabbit",
  "fish",
  "turtle",
  "lizard",
  "snake",
  "parrot",
  "canary",
  "labrador",
  "golden retriever",
  "german shepherd",
  "bulldog",
  "poodle",
  "siamese cat",
  "persian cat",
  "maine coon",
  "bengal cat",
  "tabby cat",
  "tabby",
  "domestic cat",
]

// Mapeo de categorías en inglés a español
const CATEGORY_MAPPING: Record<string, { species: string; breed?: string }> = {
  dog: { species: "perro" },
  cat: { species: "gato" },
  bird: { species: "ave" },
  hamster: { species: "hamster" },
  rabbit: { species: "conejo" },
  fish: { species: "pez" },
  turtle: { species: "tortuga" },
  lizard: { species: "lagarto" },
  snake: { species: "serpiente" },
  parrot: { species: "loro", breed: "Loro" },
  canary: { species: "ave", breed: "Canario" },
  labrador: { species: "perro", breed: "Labrador" },
  "golden retriever": { species: "perro", breed: "Golden Retriever" },
  "german shepherd": { species: "perro", breed: "Pastor Alemán" },
  bulldog: { species: "perro", breed: "Bulldog" },
  poodle: { species: "perro", breed: "Caniche" },
  "siamese cat": { species: "gato", breed: "Siamés" },
  "persian cat": { species: "gato", breed: "Persa" },
  "maine coon": { species: "gato", breed: "Maine Coon" },
  "bengal cat": { species: "gato", breed: "Bengalí" },
  "tabby cat": { species: "gato", breed: "Atigrado" },
  tabby: { species: "gato", breed: "Atigrado" },
  "domestic cat": { species: "gato", breed: "Doméstico" },
}

// Mapeo de colores en inglés a español
const COLOR_MAPPING: Record<string, string> = {
  black: "negro",
  white: "blanco",
  brown: "marrón",
  gray: "gris",
  grey: "gris",
  golden: "dorado",
  yellow: "amarillo",
  orange: "anaranjado",
  red: "rojo",
  cream: "crema",
  tan: "canela",
  chocolate: "chocolate",
  blue: "azul",
  spotted: "manchado",
  striped: "atigrado",
  tabby: "atigrado",
  bicolor: "bicolor",
  tricolor: "tricolor",
  calico: "tricolor",
  tortoiseshell: "tricolor",
}

// Palabras clave de colores en inglés para detectar en las predicciones
const COLOR_KEYWORDS = Object.keys(COLOR_MAPPING)

// Modelos
let mobilenetModel: mobilenet.MobileNet | null = null
let cocoModel: cocoSsd.ObjectDetection | null = null

// Cargar el modelo MobileNet (para clasificación detallada)
export async function loadMobilenetModel() {
  if (!mobilenetModel) {
    console.log("Cargando modelo MobileNet...")

    try {
      // Cargar el modelo MobileNet v2 (más preciso)
      mobilenetModel = await mobilenet.load({
        version: 2,
        alpha: 1.0, // Usar la versión completa para mayor precisión
      })
      console.log("Modelo MobileNet cargado")
    } catch (error) {
      console.error("Error al cargar MobileNet:", error)
      throw error
    }
  }
  return mobilenetModel
}

// Cargar el modelo COCO-SSD (para detección de objetos)
export async function loadCocoModel() {
  if (!cocoModel) {
    console.log("Cargando modelo COCO-SSD...")

    try {
      // Cargar el modelo COCO-SSD
      cocoModel = await cocoSsd.load({
        base: "mobilenet_v2", // Usar MobileNetV2 como base para mejor rendimiento
      })
      console.log("Modelo COCO-SSD cargado")
    } catch (error) {
      console.error("Error al cargar COCO-SSD:", error)
      throw error
    }
  }
  return cocoModel
}

// Cargar todos los modelos necesarios
export async function loadModel() {
  console.log("Cargando modelos de reconocimiento...")

  // Asegurarse de que se inicialice un backend antes de cargar los modelos
  try {
    // Intentar usar WebGL primero (más rápido)
    await tf.setBackend("webgl")
    console.log("Usando backend WebGL")
  } catch (e) {
    console.warn("WebGL no disponible, intentando con CPU:", e)
    try {
      // Si WebGL falla, intentar con CPU
      await tf.setBackend("cpu")
      console.log("Usando backend CPU")
    } catch (e2) {
      console.error("No se pudo inicializar ningún backend:", e2)
      throw new Error("No se pudo inicializar TensorFlow.js. Tu navegador puede no ser compatible.")
    }
  }

  // Verificar que el backend esté configurado
  console.log("Backend activo:", tf.getBackend())

  // Cargar los modelos en paralelo
  try {
    await Promise.all([loadMobilenetModel(), loadCocoModel()])
    console.log("Todos los modelos cargados")
  } catch (error) {
    console.error("Error al cargar los modelos:", error)
    throw error
  }
}

// Función principal para clasificar imágenes
export async function classifyImage(imageElement: HTMLImageElement) {
  try {
    // Asegurarse de que los modelos estén cargados
    const mobilenet = await loadMobilenetModel()
    const cocoSsd = await loadCocoModel()

    // Ejecutar ambos modelos en paralelo
    const [mobilenetPredictions, cocoDetections] = await Promise.all([
      mobilenet.classify(imageElement, 10),
      cocoSsd.detect(imageElement),
    ])

    console.log("Predicciones MobileNet:", mobilenetPredictions)
    console.log("Detecciones COCO-SSD:", cocoDetections)

    // Procesar los resultados de COCO-SSD primero (detección de objetos)
    const petDetections = cocoDetections.filter((detection) =>
      ["dog", "cat", "bird"].includes(detection.class.toLowerCase()),
    )

    // Si COCO-SSD detectó una mascota con alta confianza, usar esa información
    if (petDetections.length > 0 && petDetections[0].score > 0.7) {
      const detection = petDetections[0]

      // Combinar con las predicciones de MobileNet para obtener más detalles
      const detailedInfo = combineWithMobilenetPredictions(detection.class, mobilenetPredictions)

      return {
        ...detailedInfo,
        confidence: detection.score,
      }
    }

    // Si COCO-SSD no detectó mascotas con alta confianza, usar MobileNet
    // Filtrar predicciones relevantes para mascotas
    const petPredictions = mobilenetPredictions.filter((p) =>
      PET_CATEGORIES.some((category) => p.className.toLowerCase().includes(category.toLowerCase())),
    )

    if (petPredictions.length > 0) {
      // Usar la predicción de mascota más probable
      return processClassification(petPredictions[0].className, petPredictions[0].probability)
    }

    // Si no hay predicciones específicas de mascotas, usar la primera predicción general
    return processClassification(mobilenetPredictions[0].className, mobilenetPredictions[0].probability)
  } catch (error) {
    console.error("Error al clasificar la imagen:", error)
    throw error
  }
}

// Combinar detección de COCO-SSD con predicciones de MobileNet
function combineWithMobilenetPredictions(cocoClass: string, mobilenetPredictions: mobilenet.MobileNetPrediction[]) {
  // Mapear la clase de COCO a nuestro formato
  const baseInfo = {
    species: CATEGORY_MAPPING[cocoClass.toLowerCase()]?.species || "desconocido",
    breed: "",
    color: "",
  }

  // Buscar predicciones de MobileNet que puedan darnos más detalles
  const relevantPredictions = mobilenetPredictions.filter((p) =>
    p.className.toLowerCase().includes(cocoClass.toLowerCase()),
  )

  if (relevantPredictions.length > 0) {
    // Usar la predicción más relevante para obtener detalles adicionales
    const detailedInfo = processClassification(relevantPredictions[0].className, relevantPredictions[0].probability)

    // Combinar la información
    return {
      species: baseInfo.species,
      breed: detailedInfo.breed || baseInfo.breed,
      color: detailedInfo.color || detectColorFromPredictions(mobilenetPredictions) || getRandomColor(),
      confidence: relevantPredictions[0].probability,
    }
  }

  // Si no hay predicciones relevantes, usar la información básica
  return {
    ...baseInfo,
    color: detectColorFromPredictions(mobilenetPredictions) || getRandomColor(),
    confidence: 0.8, // Valor predeterminado de confianza
  }
}

// Detectar color a partir de múltiples predicciones
function detectColorFromPredictions(predictions: mobilenet.MobileNetPrediction[]) {
  // Concatenar todas las clases para buscar menciones de colores
  const allClasses = predictions.map((p) => p.className.toLowerCase()).join(" ")

  return detectColor(allClasses)
}

function processClassification(className: string, probability: number) {
  // Convertir el nombre de la clase a minúsculas para la comparación
  const lowerClassName = className.toLowerCase()

  // Buscar la categoría que coincida
  let matchedCategory = null
  for (const category of PET_CATEGORIES) {
    if (lowerClassName.includes(category.toLowerCase())) {
      matchedCategory = category
      break
    }
  }

  // Si no se encontró una categoría específica, usar una genérica
  if (!matchedCategory) {
    if (lowerClassName.includes("dog") || lowerClassName.includes("canine")) {
      matchedCategory = "dog"
    } else if (lowerClassName.includes("cat") || lowerClassName.includes("feline")) {
      matchedCategory = "cat"
    } else if (lowerClassName.includes("bird")) {
      matchedCategory = "bird"
    } else {
      // Categoría desconocida
      return {
        species: "desconocido",
        breed: null,
        color: detectColor(lowerClassName) || getRandomColor(),
        confidence: probability,
      }
    }
  }

  // Obtener la especie y raza mapeadas
  const { species, breed } = CATEGORY_MAPPING[matchedCategory] || { species: "desconocido" }

  // Intentar detectar el color en la descripción
  const color = detectColor(lowerClassName) || getRandomColor()

  // Verificar que los valores coincidan con las opciones disponibles
  const validatedSpecies = validateSpecies(species)
  const validatedBreed = validateBreed(validatedSpecies, breed)
  const validatedColor = validateColor(color)

  return {
    species: validatedSpecies,
    breed: validatedBreed,
    color: validatedColor,
    confidence: probability,
  }
}

// Detectar color en la descripción
function detectColor(description: string) {
  for (const keyword of COLOR_KEYWORDS) {
    if (description.includes(keyword)) {
      return COLOR_MAPPING[keyword]
    }
  }
  return null
}

// Obtener un color aleatorio de la lista predefinida
function getRandomColor() {
  const colorOption = PET_COLORS[Math.floor(Math.random() * PET_COLORS.length)]
  return colorOption.value
}

// Validar que la especie esté en la lista de opciones
function validateSpecies(species: string): string {
  const found = SPECIES_OPTIONS.find((option) => option.value === species)
  return found ? species : "otro"
}

// Validar que la raza esté en la lista correspondiente a la especie
function validateBreed(species: string, breed?: string): string {
  if (!breed) return ""

  let breedOptions
  switch (species) {
    case "perro":
      breedOptions = DOG_BREEDS
      break
    case "gato":
      breedOptions = CAT_BREEDS
      break
    case "ave":
      breedOptions = BIRD_BREEDS
      break
    default:
      breedOptions = OTHER_BREEDS
  }

  const found = breedOptions.find(
    (option) => option.value === breed || option.label.toLowerCase() === breed.toLowerCase(),
  )

  return found ? found.value : ""
}

// Validar que el color esté en la lista de opciones
function validateColor(color: string): string {
  const found = PET_COLORS.find(
    (option) => option.value === color || option.label.toLowerCase() === color.toLowerCase(),
  )

  return found ? found.value : "negro" // Default a negro si no se encuentra
}

