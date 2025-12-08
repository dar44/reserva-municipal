-- Migration para añadir políticas de seguridad al bucket de storage 'cursos'
-- Permite a admins y organizers subir imágenes de cursos

-- Política para permitir lectura pública de imágenes
CREATE POLICY "public_read_cursos_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cursos');

-- Política para permitir a staff (admin y organizer) insertar imágenes
CREATE POLICY "staff_insert_cursos_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cursos' 
  AND (auth.jwt()->>'role')::text IN ('admin', 'organizer')
);

-- Política para permitir a staff (admin y organizer) actualizar/reemplazar imágenes
CREATE POLICY "staff_update_cursos_images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cursos' 
  AND (auth.jwt()->>'role')::text IN ('admin', 'organizer')
);

-- Política para permitir a staff (admin y organizer) eliminar imágenes
CREATE POLICY "staff_delete_cursos_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cursos' 
  AND (auth.jwt()->>'role')::text IN ('admin', 'organizer')
);
