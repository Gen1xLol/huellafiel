"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pet } from "@/types/pet"

interface PetsListProps {
  pets: Pet[]
}

export default function PetsList({ pets }: PetsListProps) {
  if (pets.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No tienes mascotas registradas</h3>
        <p className="text-muted-foreground mt-1">Comienza agregando tu primera mascota</p>
      </div>
    )
  }

  // Function to format the date as DD/M/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Function to generate QR code URL for each pet
  const getQRCodeUrl = (petId) => {
    // Using a QR code generation service
    // You can replace with your preferred QR code service
    // This example uses QR Code API to generate a QR code for the pet's URL
    const petUrl = `https://huellafiel.com.ar/pets/${petId}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(petUrl)}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <Link key={pet.id} href={`/pets/${pet.id}`}>
          <Card className="h-full overflow-hidden transition-all hover:shadow-lg border-2 border-blue-200">
            <div className="bg-blue-800 text-white p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-wider">HuellaFiel</h2>
                  <p className="text-xs tracking-wide">IDENTIFICACIÓN PARA MASCOTAS</p>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex">
                <div className="w-1/3 mr-3">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300 h-24 flex items-center justify-center">
                    {/* Replace the pet image with a QR code */}
                    <img
                      src={getQRCodeUrl(pet.id)}
                      alt={`QR code para ${pet.name}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                <div className="w-2/3">
                  <div className="flex items-center">
                    <div className="w-20 text-xs text-gray-600 font-semibold">NOMBRE:</div>
                    <div className="text-lg font-bold text-blue-900">{pet.name}</div>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-20 text-xs text-gray-600 font-semibold">RAZA:</div>
                    <div className="text-sm">{pet.breed || "Sin raza especificada"}</div>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-20 text-xs text-gray-600 font-semibold">VALIDEZ:</div>
                    <div className="text-sm">{formatDate(pet.created_at)}</div>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-20 text-xs text-gray-600 font-semibold">ID:</div>
                    <div className="text-xs font-mono">{pet.id}</div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 flex justify-between bg-gradient-to-b from-blue-50 to-blue-100">
              <Badge className="bg-blue-700 hover:bg-blue-800 text-white">{pet.species}</Badge>
              <span className="text-xs text-gray-600">{new Date(pet.created_at).toLocaleDateString("es-AR")}</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

