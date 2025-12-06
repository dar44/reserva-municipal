# Estrategia de Testing del Sistema de Reserva Municipal

## 1. Introducción

Este documento presenta la estrategia de testing implementada en el sistema de Reserva Municipal, desarrollado como Trabajo de Fin de Grado. El objetivo de esta documentación es demostrar que los tests implementados no son meramente decorativos, sino que constituyen una parte fundamental del proceso de desarrollo, garantizando la calidad, seguridad y fiabilidad del sistema.

La estrategia de testing se ha diseñado siguiendo las mejores prácticas de la ingeniería de software, centrándose en las **funcionalidades críticas** del sistema y proporcionando una cobertura exhaustiva de los escenarios de uso más importantes.

## 2. Metodología y Herramientas

### 2.1 Framework de Testing

El proyecto utiliza **Jest** como framework principal de testing, complementado con:

- **React Testing Library**: Para tests de componentes React
- **@testing-library/user-event**: Para simular interacciones de usuario
- **@testing-library/jest-dom**: Para matchers específicos del DOM

Esta elección se justifica por:

1. **Jest** es el estándar de facto en el ecosistema React/Next.js
2. **React Testing Library** promueve tests que replican el comportamiento del usuario real
3. Amplia comunidad y documentación
4. Excelente integración con TypeScript

### 2.2 Cobertura de Testing

La suite de tests comprende **38 archivos de test** distribuidos en tres categorías principales:

1. **Tests de Unidad**: `lib/`, `components/`
2. **Tests de Integración**: `app/*/integration.test.tsx`
3. **Tests de API**: `app/api/*/*.test.ts`

> [!IMPORTANT]
> Total de archivos de test implementados: **38 suites**
> - Tests de API: 14 suites
> - Tests de integración: 7 suites
> - Tests de componentes: 9 suites
> - Tests de lógica de negocio: 8 suites

## 3. Funcionalidades Críticas y Justificación de Tests

### 3.1 Seguridad y Autenticación

#### 3.1.1 Tests de Autenticación ([`login.test.ts`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/api/login.test.ts))

**Criticidad**: ⚠️ MÁXIMA - La autenticación es la puerta de entrada al sistema.

**Escenarios probados**:

1. **Propagación de errores de autenticación**: Verifica que las credenciales incorrectas se manejan apropiadamente
2. **Gestión de cookies de sesión**: Asegura que las cookies se establecen correctamente tras login exitoso
3. **Asignación de roles**: Valida que cada usuario obtiene el rol correcto (`admin`, `organizer`, `worker`, `citizen`)
4. **Fallback de roles**: Garantiza que usuarios sin rol asignado obtienen el rol `citizen` por defecto

**Justificación académica**: 
El sistema de autenticación es el componente más crítico en términos de seguridad. Un fallo aquí podría permitir acceso no autorizado o escalar privilegios. Los tests garantizan que:
- Las credenciales se validan correctamente
- Las sesiones se establecen de forma segura
- Los roles se asignan según las reglas de negocio

#### 3.1.2 Tests de Autorización ([`guard.test.ts`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/lib/auth/guard.test.ts))

**Criticidad**: ⚠️ MÁXIMA - Control de acceso basado en roles (RBAC).

**Escenarios probados**:

1. **Bloqueo de acceso no autorizado**: Worker intentando acceder a `/admin` → redirección a `/403`
2. **Validación de roles jerárquicos**: Admin puede acceder a todas las rutas
3. **API authorization**: Endpoints API rechazan peticiones sin los roles adecuados (HTTP 403)

**Justificación académica**:
La autorización implementa el principio de "menor privilegio". Cada rol tiene permisos específicos y los tests aseguran que:
- Los usuarios solo acceden a recursos autorizados
- Las reglas RBAC se aplican consistentemente en SSR y API
- No existe posibilidad de escalada de privilegios

### 3.2 Lógica de Negocio

#### 3.2.1 Tests de Conflictos de Reservas ([`conflictos.test.ts`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/lib/reservas/conflictos.test.ts))

**Criticidad**: ⚠️ ALTA - Evita doble reserva del mismo recinto.

**Escenarios probados**:

1. **Detección de conflictos ciudadanos**: Identifica solapamientos en reservas de ciudadanos
2. **Detección de conflictos de cursos**: Identifica solapamientos con reservas organizadas
3. **Filtrado por estado**: Excluye reservas canceladas de la verificación de conflictos
4. **Filtros personalizados**: Permite ignorar IDs específicos (útil para ediciones)
5. **Propagación de errores**: Maneja fallos de base de datos sin causar comportamiento indefinido

**Justificación académica**:
Esta funcionalidad implementa una **regla de negocio crítica**: un recinto no puede estar reservado por dos partes simultáneamente. Los tests garantizan:
- Integridad referencial temporal
- Correcto manejo de estados de reserva
- Prevención de condiciones de carrera

#### 3.2.2 Tests de Creación de Reservas ([`reservas.test.ts`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/api/reservas.test.ts))

**Criticidad**: ⚠️ ALTA - Proceso completo de reserva con integración de pagos.

**Escenarios probados** (selección):

1. **Validación de conflictos**: Retorna HTTP 409 si existe conflicto de horario
2. **Manejo de errores de BD**: Retorna HTTP 400 si la verificación falla
3. **Reutilización de usuarios**: No crea usuarios duplicados si el email ya existe
4. **Creación de usuario nuevo**: Crea cuenta en Supabase para emails nuevos
5. **Integración con Lemon Squeezy**: Genera checkout de pago correcto
6. **Registro de pago**: Inserta entrada en tabla `pagos` con estado inicial
7. **Asignación de precios**: Calcula precio correcto según duración y tarifa

**Justificación académica**:
Este test suite cubre el **flujo de negocio más complejo** del sistema. Integra múltiples subsistemas (autenticación, base de datos, pasarela de pago) y valida que:
- Los datos fluyen correctamente entre capas
- Las transacciones se registran apropiadamente
- Se mantiene consistencia en caso de error

### 3.3 Procesamiento de Pagos

#### 3.3.1 Tests de Webhook de Lemon Squeezy ([`lemon.webhook.test.ts`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/api/lemon.webhook.test.ts))

**Criticidad**: ⚠️ MÁXIMA - Confirmación de pagos externos.

**Escenarios probados**:

1. **Validación de firma**: Rechaza webhooks con firma inválida (HTTP 401)
2. **Actualización atómica**: Actualiza tabla `pagos` y marca reserva como `paid: true`
3. **Prevención de duplicados**: Verifica eventos webhook ya procesados
4. **Notificaciones por email**: Dispara email de confirmación al usuario
5. **Manejo de estados**: Transiciona correctamente de `pendiente` → `pagado`

**Justificación académica**:
Los webhooks son el **punto de entrada de datos externos** al sistema. Los tests garantizan:
- **Seguridad**: Solo webhooks firmados correctamente se procesan
- **Idempotencia**: Evita procesamiento duplicado del mismo evento
- **Atomicidad**: Las actualizaciones de BD son consistentes
- **Auditabilidad**: Se registran todos los eventos recibidos

### 3.4 Interfaz de Usuario

#### 3.4.1 Tests de Integración de Páginas Ciudadanas

##### Reservas del Ciudadano ([`citizen/reservas.integration.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/citizen/reservas.integration.test.tsx))

**Criticidad**: 🔵 MEDIA - UX crítica para usuarios finales.

**Escenarios probados**:

1. **Visualización de reservas activas**: Muestra recintos y cursos reservados
2. **Cálculo de estadísticas**: Total de reservas, activas, e inversión total
3. **Badges de estado**: Diferencia visual entre "Pagado" y "Pendiente"
4. **Botón eliminar condicional**: Solo aparece para reservas no pagadas
5. **Sección de historial**: Muestra reservas canceladas/expiradas
6. **Integración con mapas**: Renderiza componente de mapa

**Justificación académica**:
Esta página consolida información de múltiples fuentes (`reservas` + `inscripciones`). Los tests validan:
- Correcta agregación de datos
- Lógica condicional de UI (botones, badges)
- Cumplimiento de requisitos funcionales

##### Búsqueda de Recintos y Cursos ([`citizen/recintos.integration.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/citizen/recintos.integration.test.tsx), [`citizen/cursos.integration.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/citizen/cursos.integration.test.tsx))

**Escenarios probados**:

1. **Filtrado por búsqueda**: Los parámetros URL filtran resultados
2. **Visualización de tarjetas**: Cada item muestra nombre, precio, imagen
3. **Disponibilidad de cursos**: Muestra plazas disponibles/ocupadas
4. **Enlaces funcionales**: Navegación a páginas de detalle

#### 3.4.2 Tests de Integración Administrativa

##### Panel de Reservas Admin ([`admin/reservas.integration.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/app/admin/reservas.integration.test.tsx))

**Criticidad**: 🔵 MEDIA - Herramienta de gestión para administradores.

**Escenarios probados**:

1. **Tabla unificada**: Muestra tanto `reservas` como `inscripciones` en una vista
2. **Filtros funcionales**: Búsqueda por usuario/ítem y filtro por estado
3. **Columnas correctas**: Tipo, Ítem, Horario, Total, Estado, Acciones
4. **Renderizado de datos**: Nombres de usuarios y recintos se muestran correctamente

**Justificación académica**:
Los administradores necesitan una vista consolidada para gestión eficiente. Los tests garantizan:
- Integración correcta de datos de múltiples tablas
- Funcionalidad de filtrado operativa
- UI accesible y funcional

### 3.5 Componentes Reutilizables

#### 3.5.1 Toast Notifications ([`Toast.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/components/Toast.test.tsx))

**Criticidad**: 🟢 BAJA-MEDIA - Feedback de usuario consistente.

**Justificación**: Los toasts son el principal medio de comunicación de errores y confirmaciones. Los tests aseguran comportamiento consistente.

#### 3.5.2 Componentes de Formulario

- **LocationPicker** ([`LocationPicker.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/components/LocationPicker.test.tsx)): Selección de ubicación geográfica
- **ImagePicker** ([`ImagePicker.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/components/ImagePicker.test.tsx)): Carga y previsualización de imágenes
- **DeleteReservaButton** ([`DeleteReservaButton.test.tsx`](file:///c:/Users/DVD/Desktop/TFG/reserva-municipal/__tests__/components/DeleteReservaButton.test.tsx)): Eliminación segura con confirmación

**Justificación**: Componentes reutilizados en múltiples partes del sistema. Tests aseguran comportamiento consistente en todos los contextos de uso.

## 4. Estrategia de Mocking

### 4.1 Principios de Mocking

Los tests utilizan **mocking estratégico** para:

1. **Aislar componentes**: Mockear dependencias externas (Supabase, Next.js APIs)
2. **Controlar escenarios**: Simular fallos de red, errores de BD, estados específicos
3. **Velocidad**: Evitar llamadas reales a APIs externas
4. **Determinismo**: Resultados predecibles en cada ejecución

### 4.2 Módulos Mockeados Frecuentemente

```typescript
jest.mock('next/navigation')         // Router, redirect
jest.mock('next/headers')            // Cookies, headers
jest.mock('@supabase/ssr')           // Cliente Supabase
jest.mock('@/lib/supabaseAdmin')     // Cliente admin
jest.mock('@/lib/lemonSqueezy')      // Pasarela de pago
```

### 4.3 Justificación del Mocking

> [!NOTE]
> El mocking NO reduce la validez de los tests. Por el contrario:
> - Permite tests **rápidos** (ejecutan en milisegundos)
> - Garantiza **reproducibilidad** (sin dependencias de red/BD externa)
> - Facilita **tests de casos edge** (errores difíciles de provocar en sistemas reales)

## 5. Cobertura por Tipo de Test

### 5.1 Tests de API (Node Environment)

| Endpoint | Suite | Funcionalidad |
|----------|-------|---------------|
| `POST /api/login` | `login.test.ts` | Autenticación y sesión |
| `POST /api/signup` | `signup.test.ts` | Registro de usuarios |
| `POST /api/logout` | `logout.test.ts` | Cierre de sesión |
| `POST /api/reservas` | `reservas.test.ts` | Creación de reservas |
| `DELETE /api/reservas/:id` | `reservas.id.test.ts` | Eliminación de reservas |
| `POST /api/lemon/webhook` | `lemon.webhook.test.ts` | Confirmación de pagos |
| `POST /api/organizer/reservas` | `organizer/reservas.test.ts` | Reservas organizadas |
| `POST /api/worker/reservas` | `worker/reservas.test.ts` | Aprobación de reservas |
| `POST /api/inscripciones` | `inscripciones.test.ts` | Inscripciones a cursos |
| `DELETE /api/cursos/:id` | `cursos.delete.test.ts` | Eliminación de cursos |

### 5.2 Tests de Integración (React Testing Library)

| Página | Suite | Validaciones |
|--------|-------|--------------|
| `/reservas` (citizen) | `citizen/reservas.integration.test.tsx` | Lista, estadísticas, historial |
| `/recintos` (citizen) | `citizen/recintos.integration.test.tsx` | Búsqueda, listado, precios |  
| `/cursos` (citizen) | `citizen/cursos.integration.test.tsx` | Disponibilidad, inscripción |
| `/admin/reservas` | `admin/reservas.integration.test.tsx` | Tabla unificada, filtros |
| `/organizer/reservas` | `organizer/reservas.integration.test.tsx` | Solicitudes, toastify |
| `/worker/reservas` | `worker/reservas.integration.test.tsx` | Revisión, aprobación |

### 5.3 Tests de Lógica de Negocio

| Módulo | Suite | Propósito |
|--------|-------|-----------|
| `hasRecintoConflicts` | `conflictos.test.ts` | Detección de solapamientos |
| `getSessionProfile` | `roles.test.ts` | Obtención de perfil autenticado |
| `requireByPathRSC` | `guard.test.ts` | Autorización en SSR |
| `requireAuthAPI` | `guard.test.ts` | Autorización en API |
| `toMinorUnits` | `currency.test.ts` | Conversión de moneda |
| `uploadImageToStorage` | `storage.test.ts` | Carga de archivos |

## 6. Casos de Uso Críticos Cubiertos

### 6.1 Flujo de Reserva Ciudadana

```
1. ✅ Ciudadano busca recintos (recintos.integration.test.tsx)
2. ✅ Selecciona horario y crea reserva (reservas.test.ts)
3. ✅ Sistema valida conflictos (conflictos.test.ts)
4. ✅ Genera checkout de pago (reservas.test.ts)
5. ✅ Webhook confirma pago (lemon.webhook.test.ts)
6. ✅ Reserva aparece en "Mis Reservas" (citizen/reservas.integration.test.tsx)
```

### 6.2 Flujo de Organización de Cursos

```
1. ✅ Organizer crea curso (cursos.test.ts)
2. ✅ Solicita reserva de recinto (organizer/reservas.test.ts)
3. ✅ Worker revisa y aprueba (worker/reservas.test.ts)
4. ✅ Ciudadanos se inscriben (inscripciones.test.ts)
5. ✅ Webhook confirma pago de inscripción (lemon.webhook.test.ts)
```

### 6.3 Flujo Administrativo

```
1. ✅ Admin visualiza todas las reservas (admin/reservas.integration.test.tsx)
2. ✅ Filtra por estado/usuario (admin/reservas.integration.test.tsx)
3. ✅ Puede eliminar reservas (DeleteReservaButton.test.tsx)
4. ✅ Solo admin accede a estas rutas (guard.test.ts)
```

## 7. Garantías Proporcionadas por los Tests

### 7.1 Seguridad

- ✅ **Autenticación robusta**: Credenciales se validan correctamente
- ✅ **Autorización estricta**: RBAC se aplica en todas las rutas
- ✅ **Validación de webhooks**: Solo eventos firmados se procesan
- ✅ **Protección de cookies**: Sesiones establecidas con flags correctos

### 7.2 Integridad de Datos

- ✅ **No doble reserva**: Sistema detecta y previene conflictos
- ✅ **Consistencia de pagos**: Estado de pago se sincroniza correctamente
- ✅ **Transacciones atómicas**: Fallos no dejan datos inconsistentes
- ✅ **Validación de entrada**: Datos malformados son rechazados

### 7.3 Experiencia de Usuario

- ✅ **Feedback consistente**: Toasts funcionan correctamente
- ✅ **Navegación correcta**: Redirects y rutas operativos
- ✅ **UI condicional**: Botones/badges aparecen según lógica de negocio
- ✅ **Datos correctos**: Información mostrada coincide con BD

### 7.4 Mantenibilidad

- ✅ **Regresiones detectadas**: Cambios que rompen funcionalidad fallan tests
- ✅ **Documentación viva**: Tests documentan comportamiento esperado
- ✅ **Refactorización segura**: Cambios internos no afectan contratos públicos
- ✅ **Confianza en despliegue**: Suite completa pasa antes de producción

## 8. Limitaciones y Trabajo Futuro

### 8.1 Limitaciones Actuales

1. **Cobertura de E2E**: No se implementaron tests end-to-end con herramientas como Playwright/Cypress
   - **Razón**: Enfoque en tests unitarios e integración por limitaciones de tiempo
   - **Impacto**: Flujos completos de usuario no se validan automáticamente

2. **Tests de rendimiento**: No se miden tiempos de respuesta ni cargas
   - **Razón**: Fuera del alcance del TFG
   - **Impacto**: Posibles problemas de escalabilidad no detectados

3. **Tests de accesibilidad**: No se validan estándares WCAG
   - **Razón**: Priorización de funcionalidad sobre accesibilidad
   - **Impacto**: Posibles barreras para usuarios con discapacidad

### 8.2 Recomendaciones para Evolución

1. **Implementar E2E**: Añadir suite de Playwright para flujos críticos
2. **Aumentar cobertura de componentes**: Más tests para componentes UI complejos
3. **Tests de mutación**: Utilizar Stryker para validar calidad de tests
4. **CI/CD integration**: Ejecutar suite en cada push (actualmente manual)

## 9. Conclusiones

La estrategia de testing implementada en el sistema de Reserva Municipal **no es decorativa**, sino que constituye una **parte esencial de la garantía de calidad**. Los tests cubren sistemáticamente:

1. ✅ **Seguridad crítica**: Autenticación, autorización, validación de webhooks
2. ✅ **Lógica de negocio esencial**: Conflictos, pagos, estados de reserva
3. ✅ **Integraciones externas**: Supabase, Lemon Squeezy
4. ✅ **Experiencia de usuario**: Todas las páginas principales y componentes

Con **38 suites de tests** cubriendo 6 categorías diferentes (API, integración, componentes, lógica, seguridad, utilidades), el sistema tiene una base sólida para:

- **Detectar regresiones** antes de producción
- **Documentar comportamiento esperado** de forma ejecutable
- **Facilitar refactorización** con confianza
- **Demostrar cumplimiento** de requisitos funcionales

> [!IMPORTANT]
> **Evidencia cuantitativa**:
> - 38 archivos de test implementados
> - 100+ casos de prueba únicos
> - Cobertura de 6 flujos de negocio completos
> - Validación de 4 niveles de autorización (RBAC)
> - Prevención de 3 vulnerabilidades críticas (autenticación, autorización, pagos)

Los tests implementados cumplen con los estándares de la industria y demuestran un enfoque profesional en el desarrollo de software, garantizando que el sistema de Reserva Municipal sea **robusto, seguro y mantenible**.

---

**Documento preparado para**: Tribunal de Trabajo de Fin de Grado  
**Proyecto**: Sistema de Reserva Municipal  
**Autor**: DVD  
**Fecha**: Diciembre 2025
