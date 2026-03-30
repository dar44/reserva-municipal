# Sistema de Reserva Municipal

Plataforma integral para la gestión de recintos deportivos municipales, inscripción a cursos y control de acceso. Desarrollada con tecnologías modernas para garantizar escalabilidad, seguridad y una excelente experiencia de usuario.

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success)
![Versión](https://img.shields.io/badge/Version-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

## Tecnologías Principales

- **Frontend/Backend**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/)
- **Pagos**: [Lemon Squeezy](https://www.lemonsqueezy.com/)
- **Emails**: [Resend](https://resend.com/) + [React Email](https://react.email/)
- **Mapas**: [Leaflet](https://leafletjs.com/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)

---

## Requisitos Previos

- **Node.js**: v18.17.0 o superior
- **npm**: v9.0.0 o superior
- **Cuenta en Supabase**: Para la base de datos y autenticación.
- **Cuenta en Lemon Squeezy**: En modo test para pagos.
- **Cuenta en Resend**: Para envío de correos.

---

## Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/reserva-municipal.git
   cd reserva-municipal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes claves:

   ```env
   # Supabase (Base de datos y Auth)
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreta

   # Lemon Squeezy (Pagos)
   LEMON_SQUEEZY_API_KEY=tu-api-key
   LEMON_SQUEEZY_WEBHOOK_SECRET=tu-webhook-secret
   LEMON_SQUEEZY_STORE_ID=tu-store-id

   # Resend (Emails)
   RESEND_API_KEY=tu-resend-api-key

   # Configuración General
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Inicializar Base de Datos**
   Ejecuta los scripts SQL ubicados en `supabase/migrations/` en el editor SQL de tu panel de Supabase para crear las tablas y políticas RLS.

---

## Ejecución

### Entorno de Desarrollo
Para iniciar el servidor de desarrollo con hot-reloading:

```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Producción
Para construir y probar la versión optimizada para producción:

```bash
npm run build
npm start
```

---

## Testing

El proyecto cuenta con una suite exhaustiva de **38 suites de tests** cubriendo API, componentes, integración y lógica de negocio.

- **Ejecutar todos los tests**:
  ```bash
  npm test
  ```

- **Ejecutar en modo vigilancia (watch)**:
  ```bash
  npm run test:watch
  ```

- **Generar reporte de cobertura**:
  ```bash
  npm run test:coverage
  ```

Para más detalles sobre la metodología de pruebas, consulta [Docs: Estrategia de Testing](docs/estrategia-testing.md).

---

## Estructura del Proyecto

```
/src
  /app              # Rutas y páginas (App Router)
    /api            # API Routes (Backend)
    /admin          # Panel de Administrador
    /citizen        # Panel de Ciudadano
    /worker         # Panel de Trabajador
    /organizer      # Panel de Organizador
  /components       # Componentes React reutilizables
    /ui             # UI Kit base (Botones, Inputs, Cards)
    /emails         # Plantillas React Email
  /lib              # Lógica de negocio y utilidades
    /reservas       # Lógica de conflictos y reservas
    /supabase       # Cliente Supabase
  /types            # Definiciones de tipos TypeScript
/docs               # Documentación técnica
/supabase           # Migraciones y configuración DB
```

---

## Despliegue

Este proyecto está optimizado para desplegarse en **Netlify**.

1. Conecta tu repositorio de GitHub a Netlify.
2. Configura las variables de entorno en el panel de Netlify (Site settings > Environment variables).
3. El comando de build se detectará automáticamente (`npm run build`).
4. ¡Despliegue automático con cada push a `main`!

---

## Seguridad

Consulta el reporte de [Vulnerabilidades de Seguridad Corregidas](docs/vulnerabilidades-seguridad-corregidas.md) para ver cómo se han mitigado riesgos comunes (XSS, CSRF, Inyección SQL) en este desarrollo.

---

**Trabajo de Fin de Grado - Ingeniería Informática**
*Autor: David*
