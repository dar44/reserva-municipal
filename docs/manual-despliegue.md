# Manual de Despliegue y Configuración

Esta guía detalla paso a paso el proceso para desplegar el Sistema de Reserva Municipal en un entorno de producción utilizando Netlify, conectándolo con los servicios de Supabase, Lemon Squeezy y Resend.

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener cuentas activas en los siguientes servicios:
- **GitHub**: Repositorio con el código fuente actualizado.
- **Supabase**: Proyecto creado y base de datos inicializada.
- **Lemon Squeezy**: Tienda configurada en modo Test.
- **Resend**: Dominio verificado (o usar el de pruebas) para envío de emails.
- **Netlify**: Cuenta para hosting del frontend/backend.

---

## 2. Configuración de Supabase (Base de Datos)

1.  **Crear Proyecto**: En el dashboard de Supabase, crea un nuevo proyecto. Asigna una contraseña segura a la base de datos.
2.  **Ejecutar Migraciones**:
    - Ve al apartado **SQL Editor**.
    - Copia el contenido de `supabase/migrations/` (en orden cronológico) y ejecútalo.
    - Esto creará las tablas (`recintos`, `reservas`, `profiles`, etc.) y las políticas de seguridad (RLS).
3.  **Configurar Auth**:
    - En **Authentication > URL Configuration**, añade la URL de producción de tu sitio (ej: `https://mi-reserva-municipal.netlify.app`) en **Site URL**.
    - Añade también las URLs de redirección necesarias (ej: `https://.../auth/callback`).

---

## 3. Configuración de Lemon Squeezy (Pagos)

1.  **Crear Producto**:
    - Crea un producto "Reserva de Instalación" (o genérico).
    - Configura el precio (puede ser 0 en modo test).
2.  **Configurar Webhook**:
    - Ve a **Settings > Webhooks**.
    - URL del Webhook: `https://TU_DOMINIO_NETLIFY/api/lemon/webhook`
    - Eventos a escuchar: `order_created`.
    - **Signing Secret**: Genera un secreto y guárdalo (lo necesitarás en las variables de entorno).

---

## 4. Configuración de Resend (Emails)

1.  **API Key**: Genera una API Key desde el panel de Resend con permisos de envío (`sending_access`).
2.  **Verificación de Dominio**: (Opcional para producción real) Configura los registros DNS DKIM/SPF para asegurar la entrega.

---

## 5. Despliegue en Netlify

1.  **Nuevo Sitio desde Git**:
    - En Netlify, selecciona "Add new site" -> "Import an existing project".
    - Conecta con GitHub y selecciona el repositorio `reserva-municipal`.
2.  **Configuración de Build**:
    - **Build command**: `npm run build`
    - **Publish directory**: `.next` (Netlify detectará automáticamente el plugin de Next.js).
3.  **Variables de Entorno**:
    - En "Site configuration" > "Environment variables", añade las siguientes claves obligatorias:

    | Clave | Descripción | Origen |
    |-------|-------------|--------|
    | `NEXT_PUBLIC_SUPABASE_URL` | URL de la API de Supabase | Supabase > Project Settings |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima | Supabase > Project Settings |
    | `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (Service Role) | Supabase > Project Settings |
    | `LEMON_SQUEEZY_API_KEY` | API Key de Lemon Squeezy | Lemon Squeezy > Settings |
    | `LEMON_SQUEEZY_WEBHOOK_SECRET` | Secreto de firma del webhook | Lemon Squeezy > Webhooks |
    | `LEMON_SQUEEZY_STORE_ID` | ID de la tienda | Lemon Squeezy > Stores |
    | `RESEND_API_KEY` | API Key para emails | Resend Dashboard |
    | `NEXT_PUBLIC_BASE_URL` | URL pública del sitio | Netlify (ej: `https://...app`) |

4.  **Desplegar**: Haz clic en "Deploy site". Netlify construirá el proyecto y lo publicará.

---

## 6. Verificación Post-Despliegue

Una vez el sitio esté online ("Published"):

1.  **Probar Registro**: Intenta registrar un usuario nuevo. Deberías recibir el correo de bienvenida.
2.  **Probar Reserva (Modo Test)**:
    - Inicia sesión como ciudadano.
    - Reserva un recinto.
    - Usa la tarjeta de prueba de Lemon Squeezy (`4242...`).
    - Verifica que tras el pago, la reserva cambia a "Confirmada" y recibes el email.
3.  **Verificar Webhook**: Revisa los logs de funciones en Netlify para confirmar que el webhook devolvió `200 OK`.

---

**Nota de Mantenimiento**:
Para actualizar el sitio, simplemente haz `push` a la rama `main` en GitHub. Netlify redespelgará automáticamente los cambios.
