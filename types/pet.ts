export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  breed?: string
  age?: string
  color?: string
  description?: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  contact_address?: string
  main_photo_url?: string
  created_at: string
  updated_at: string
}

export interface PetPhoto {
  id: string
  pet_id: string
  photo_url: string
  is_main: boolean
  created_at: string
}

