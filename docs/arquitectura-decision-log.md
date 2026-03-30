# Registro de Decisiones de Arquitectura (ADR)

Este documento registra las decisiones arquitectónicas clave tomadas durante el desarrollo del Sistema de Reserva Municipal, justificando el contexto, las alternativas consideradas y las consecuencias.

## ADR-001: Adopción de Next.js 16 (App Router)

- **Estado**: Aceptado
- **Contexto**: Necesitamos un framework React que soporte renderizado híbrido (SSR/CSR) para optimizar el SEO del catálogo público y la interactividad de los paneles privados.
- **Decisión**: Utilizar **Next.js 16 con App Router**.
- **Consecuencias**:
    - **Positivas**: Mejor rendimiento inicial (Server Components), routing basado en sistema de archivos intuitivo, soporte nativo de API Routes.
    - **Negativas**: Curva de aprendizaje del nuevo modelo mental de Server/Client Components. Mayor complejidad en la gestión de estado que cruza la frontera servidor/cliente.

## ADR-002: Base de Datos Relacional Gestionada (Supabase)

- **Estado**: Aceptado
- **Contexto**: El sistema requiere una base de datos relacional robusta (integridad referencial para reservas) y un sistema de autenticación seguro, con recursos de desarrollo limitados (equipo unipersonal).
- **Decisión**: Utilizar **Supabase (PostgreSQL)** como Backend-as-a-Service.
- **Consecuencias**:
    - **Positivas**: PostgreSQL completo con extensiones (pgcrypto), Auth integrado "out-of-the-box", API instantánea via PostgREST, seguridad a nivel de fila (RLS) muy granular.
    - **Negativas**: Acoplamiento fuerte a la infraestructura de Supabase (vendor lock-in moderado).

## ADR-003: Row Level Security (RLS) para Autorización

- **Estado**: Aceptado
- **Contexto**: Necesitamos asegurar que los usuarios solo accedan a sus propios datos. La lógica de autorización en la capa de aplicación (API) es propensa a errores humanos.
- **Decisión**: Implementar la seguridad directamente en la base de datos usando **PostgreSQL RLS**.
- **Consecuencias**:
    - **Positivas**: "Security by Default". Incluso si un desarrollador olvida un filtro `WHERE user_id = ...` en la API, la base de datos no devolverá los registros. Centralización de políticas de seguridad.
    - **Negativas**: Las políticas SQL pueden ser complejas de escribir y depurar. Requiere conocimientos avanzados de PostgreSQL.

## ADR-004: Pasarela de Pagos Lemon Squeezy (Merchant of Record)

- **Estado**: Aceptado
- **Contexto**: Necesitamos procesar pagos internacionales y gestionar impuestos (IVA) sin complicación legal/fiscal excesiva para el ayuntamiento.
- **Decisión**: Utilizar **Lemon Squeezy** actuando como Merchant of Record.
- **Consecuencias**:
    - **Positivas**: Ellos gestionan la complejidad fiscal del IVA digital. API sencilla y webhooks robustos. Checkout hospedado optimizado.
    - **Negativas**: Comisiones ligeramente más altas que Stripe directo. Menor control sobre la UI del checkout.

## ADR-005: Estilos con Tailwind CSS v4 y Design Tokens

- **Estado**: Aceptado
- **Contexto**: Se requiere un diseño consistente, responsivo y con soporte de temas (claro/oscuro), con un tiempo de desarrollo rápido.
- **Decisión**: Utilizar **Tailwind CSS v4** con configuración de variables CSS nativas para tokens de diseño.
- **Consecuencias**:
    - **Positivas**: Iteraicón visual muy rápida. Sin CSS legacy que mantener. Tailwind v4 compila instantáneamente. Tokens semánticos facilitan el modo oscuro.
    - **Negativas**: HTML verboso ("class soup"). Requiere extracción de componentes para reutilización.

## ADR-006: Estrategia de Testing (Pirámide)

- **Estado**: Aceptado
- **Contexto**: Necesitamos asegurar la calidad sin ralentizar excesivamente el desarrollo.
- **Decisión**: Priorizar tests de integración de API y componentes críticos sobre tests E2E completos (Cypress/Playwright).
- **Consecuencias**:
    - **Positivas**: Feedback loop rápido (Jest corre en segundos). Menor fragilidad que los tests E2E que dependen de selectores UI cambiantes.
    - **Negativas**: Menor garantía de que el sistema funciona "como un todo" en un navegador real (aunque se mitiga con tests manuales documentados).

---
*Documento vivo mantenido durante el ciclo de vida del proyecto.*
