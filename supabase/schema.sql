-- Eliminar tablas existentes si es necesario (en caso de recreación)
DROP TABLE IF EXISTS public.pet_photos;
DROP TABLE IF EXISTS public.pets;
DROP TABLE IF EXISTS public.profiles;

-- Crear tablas para la plataforma de identificación de mascotas

-- Tabla de perfiles de usuario (extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mascotas (simplificada y optimizada para búsquedas)
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  -- Campos de características principales (normalizados para búsqueda)
  species TEXT NOT NULL,
  species_normalized TEXT GENERATED ALWAYS AS (LOWER(species)) STORED,
  breed TEXT,
  breed_normalized TEXT GENERATED ALWAYS AS (LOWER(breed)) STORED,
  color TEXT,
  color_normalized TEXT GENERATED ALWAYS AS (LOWER(color)) STORED,
  age TEXT,
  description TEXT,
  -- Campos de contacto
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  contact_address TEXT,
  -- Foto principal y metadatos
  main_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fotos de mascotas
CREATE TABLE IF NOT EXISTS public.pet_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las búsquedas
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species_normalized);
CREATE INDEX IF NOT EXISTS idx_pets_breed ON public.pets(breed_normalized);
CREATE INDEX IF NOT EXISTS idx_pets_color ON public.pets(color_normalized);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);

-- Configurar seguridad a nivel de fila (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para mascotas
-- Permitir que todos los usuarios autenticados vean todas las mascotas (para búsqueda)
CREATE POLICY "Los usuarios autenticados pueden ver todas las mascotas" 
  ON public.pets FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Los usuarios solo pueden crear/editar/eliminar sus propias mascotas
CREATE POLICY "Los usuarios pueden crear sus propias mascotas" 
  ON public.pets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias mascotas" 
  ON public.pets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias mascotas" 
  ON public.pets FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para fotos de mascotas
-- Permitir que todos los usuarios autenticados vean todas las fotos (para búsqueda)
CREATE POLICY "Los usuarios autenticados pueden ver todas las fotos de mascotas" 
  ON public.pet_photos FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Los usuarios solo pueden crear/editar/eliminar fotos de sus propias mascotas
CREATE POLICY "Los usuarios pueden crear fotos para sus propias mascotas" 
  ON public.pet_photos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_photos.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden actualizar fotos de sus propias mascotas" 
  ON public.pet_photos FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_photos.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden eliminar fotos de sus propias mascotas" 
  ON public.pet_photos FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_photos.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Crear buckets de almacenamiento
INSERT INTO storage.buckets (id, name, public) VALUES ('pet_photos', 'Fotos de Mascotas', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('pet_search', 'Búsqueda de Mascotas', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de almacenamiento para fotos de mascotas
CREATE POLICY "Acceso público a fotos de mascotas" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'pet_photos');

CREATE POLICY "Los usuarios autenticados pueden cargar fotos de mascotas" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'pet_photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Los usuarios pueden actualizar sus propias fotos" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'pet_photos' 
    AND owner = auth.uid()
  );

CREATE POLICY "Los usuarios pueden eliminar sus propias fotos" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'pet_photos' 
    AND owner = auth.uid()
  );

-- Políticas de almacenamiento para búsqueda de mascotas
CREATE POLICY "Acceso público a fotos de búsqueda" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'pet_search');

CREATE POLICY "Los usuarios autenticados pueden cargar fotos para búsqueda" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'pet_search' 
    AND auth.role() = 'authenticated'
  );

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el timestamp en perfiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar el timestamp en mascotas
CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para asegurar que hay resultados en las búsquedas
-- Estos datos se insertarán solo si la tabla está vacía
INSERT INTO public.pets (
  id, user_id, name, species, breed, color, age, description, 
  contact_name, contact_phone, contact_email, contact_address, main_photo_url
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', -- Usuario de sistema para datos de ejemplo
  'Luna', 
  'perro', 
  'Labrador', 
  'dorado', 
  '3 años', 
  'Luna es una perra muy amigable y juguetona. Le encanta correr y jugar con pelotas.',
  'Sistema', 
  '123456789', 
  'sistema@huellafiel.com', 
  'Buenos Aires, Argentina',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM public.pets LIMIT 1);

INSERT INTO public.pets (
  id, user_id, name, species, breed, color, age, description, 
  contact_name, contact_phone, contact_email, contact_address, main_photo_url
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', -- Usuario de sistema para datos de ejemplo
  'Simba', 
  'gato', 
  'Siamés', 
  'blanco', 
  '2 años', 
  'Simba es un gato muy tranquilo y cariñoso. Le gusta dormir en lugares cálidos.',
  'Sistema', 
  '123456789', 
  'sistema@huellafiel.com', 
  'Córdoba, Argentina',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM public.pets LIMIT 1);

INSERT INTO public.pets (
  id, user_id, name, species, breed, color, age, description, 
  contact_name, contact_phone, contact_email, contact_address, main_photo_url
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', -- Usuario de sistema para datos de ejemplo
  'Rocky', 
  'perro', 
  'Pastor Alemán', 
  'negro', 
  '4 años', 
  'Rocky es un perro muy inteligente y protector. Está bien entrenado y es excelente con los niños.',
  'Sistema', 
  '123456789', 
  'sistema@huellafiel.com', 
  'Rosario, Argentina',
  'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM public.pets LIMIT 1);

INSERT INTO public.pets (
  id, user_id, name, species, breed, color, age, description, 
  contact_name, contact_phone, contact_email, contact_address, main_photo_url
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', -- Usuario de sistema para datos de ejemplo
  'Milo', 
  'perro', 
  'Bulldog', 
  'marrón', 
  '2 años', 
  'Milo es un bulldog muy juguetón y cariñoso. Le encanta recibir caricias y dormir.',
  'Sistema', 
  '123456789', 
  'sistema@huellafiel.com', 
  'Mendoza, Argentina',
  'https://images.unsplash.com/photo-1583511655826-05700442b31b?q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM public.pets LIMIT 1);

INSERT INTO public.pets (
  id, user_id, name, species, breed, color, age, description, 
  contact_name, contact_phone, contact_email, contact_address, main_photo_url
)
SELECT 
  gen_random_uuid(), 
  '00000000-0000-0000-0000-000000000000', -- Usuario de sistema para datos de ejemplo
  'Coco', 
  'ave', 
  'Loro', 
  'verde', 
  '1 año', 
  'Coco es un loro muy inteligente que puede repetir varias palabras. Es muy colorido y alegre.',
  'Sistema', 
  '123456789', 
  'sistema@huellafiel.com', 
  'Salta, Argentina',
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM public.pets LIMIT 1);

