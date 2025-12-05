-- Migration para añadir campos de horario a la tabla cursos y expandir status de reservas
-- Ejecutar en Supabase SQL Editor o guardarlo como migración

-- 1. Añadir campos de horario a la tabla cursos
ALTER TABLE public.cursos
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS days_of_week INTEGER[];

COMMENT ON COLUMN public.cursos.start_time IS 'Hora de inicio del curso (ej: 11:00)';
COMMENT ON COLUMN public.cursos.end_time IS 'Hora de fin del curso (ej: 12:00)';
COMMENT ON COLUMN public.cursos.days_of_week IS 'Array de días de la semana (1=Lunes, 7=Domingo). Ej: {1,3} para Lunes y Miércoles';

-- 2. Añadir nuevos valores al ENUM status_activa para reservas
-- Opción A: Añadir valores al ENUM existente
ALTER TYPE public.status_activa ADD VALUE IF NOT EXISTS 'pendiente';
ALTER TYPE public.status_activa ADD VALUE IF NOT EXISTS 'confirmada';

-- NOTA: Los ENUMs en PostgreSQL no permiten eliminar valores fácilmente.
-- Si quieres más flexibilidad, considera la Opción B:

-- Opción B (alternativa): Cambiar a VARCHAR en lugar de ENUM
-- ADVERTENCIA: Esto requiere más pasos y puede romper datos existentes si no se hace con cuidado
/*
-- Paso 1: Añadir columna temporal
ALTER TABLE public.reservas ADD COLUMN status_new VARCHAR(50);

-- Paso 2: Copiar datos existentes
UPDATE public.reservas SET status_new = status::text;

-- Paso 3: Eliminar columna antigua
ALTER TABLE public.reservas DROP COLUMN status;

-- Paso 4: Renombrar columna nueva
ALTER TABLE public.reservas RENAME COLUMN status_new TO status;

-- Paso 5: Establecer valor por defecto
ALTER TABLE public.reservas ALTER COLUMN status SET DEFAULT 'pendiente';

-- Paso 6: Hacer lo mismo con inscripciones si es necesario
ALTER TABLE public.inscripciones ADD COLUMN status_new VARCHAR(50);
UPDATE public.inscripciones SET status_new = status::text;
ALTER TABLE public.inscripciones DROP COLUMN status;
ALTER TABLE public.inscripciones RENAME COLUMN status_new TO status;
ALTER TABLE public.inscripciones ALTER COLUMN status SET DEFAULT 'pendiente';
*/
