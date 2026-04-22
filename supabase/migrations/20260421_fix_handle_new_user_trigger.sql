-- Fix handle_new_user trigger: use NULLIF so empty strings become NULL,
-- and fix the schema so dni/surname/phone are nullable (they may not always be provided).
-- Also replace the UNIQUE constraint on dni with a PARTIAL unique index
-- so that multiple NULL values are allowed (only non-NULL dnis must be unique).

-- 1. Hacer nullable surname, dni, phone
ALTER TABLE public.users ALTER COLUMN surname DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN dni    DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN phone  DROP NOT NULL;

-- 2. Eliminar el unique constraint actual en dni
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_dni_key;

-- 3. Crear un unique index PARCIAL: solo es único cuando no es NULL
--    Esto permite múltiples filas con dni = NULL
CREATE UNIQUE INDEX IF NOT EXISTS users_dni_key ON public.users (dni) WHERE dni IS NOT NULL;

-- 4. Corregir el trigger para usar NULL en vez de '' cuando no hay valor
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.users (
    uid, email, name, surname, dni, phone, role, created_at, updated_at
  ) values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email,'@',1)),
    nullif(new.raw_user_meta_data->>'surname', ''),
    nullif(new.raw_user_meta_data->>'dni', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'citizen',
    now(), now()
  )
  on conflict (uid) do nothing;

  return new;
end;
$function$;
