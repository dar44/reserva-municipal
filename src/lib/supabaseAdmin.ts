//se usará en el backend  (Route Handlers / Server Actions)
//  para crear usuarios y tocar datos sin restricciones
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
)