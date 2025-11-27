// jest.env.setup.ts
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key';
process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL ?? 'https://app.example.com/reset';
