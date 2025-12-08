-- Añadir 'organizer' al enum user_role
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'organizer';

-- Comentario: Ahora el enum user_role contiene: 'admin', 'worker', 'citizen', 'organizer'
