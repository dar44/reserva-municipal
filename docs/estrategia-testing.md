# Estrategia de Testing y Aseguramiento de Calidad

Este documento detalla la estrategia de pruebas implementada en el Sistema de Reserva Municipal para garantizar la robustez, fiabilidad y mantenibilidad del software. Se han desarrollado un total de **38 suites de tests** que cubren desde componentes unitarios hasta flujos de integración complejos.

## 1. Enfoque y Metodología

La estrategia de testing sigue la **Pirámide de Testing**, priorizando tests rápidos y aislados en la base, complementados con tests de integración para validar interacciones críticas.

- **Herramientas**: Jest (Runner y Assertions), React Testing Library (Renderizado y Eventos de Usuario), node-mocks-http (Mocking de API Requests/Responses).
- **Cobertura**: Se prioriza la cobertura de caminos críticos (Happy Path) y casos borde (Edge Cases) en lógica de negocio.

## 2. Clasificación de Tests

### 2.1. Tests de Lógica de Negocio y Utilidades (Unitarios)
Validan funciones puras y lógica compleja aislada de la interfaz de usuario. Son la base de la fiabilidad del sistema.

*   **Conflictos de Reserva** (`lib/reservas/conflictos.test.ts`): Verifica rigurosamente que no se puedan crear reservas solapadas. Prueba casos de solapamiento total, parcial, adyacente y validación de horarios límite.
*   **Formato de Precios y Fechas**: Asegura que la moneda (CLP) y las fechas se formateen correctamente según la localización del usuario.
*   **Validadores de Zod**: Comprueba que los esquemas de validación de formularios rechacen datos inválidos y acepten datos correctos.

### 2.2. Tests de Componentes (Unitarios/Integración UI)
Verifican que los componentes de React se rendericen correctamente y respondan adecuadamente a la interacción del usuario.

*   **LocationPicker**: Valida la integración con Leaflet, asegurando que al hacer clic en el mapa se capturen las coordenadas correctas.
*   **ImagePicker**: Prueba la carga de archivos, la previsualización de imágenes y el manejo de estados de carga/error.
*   **Componentes UI Base**: Tests para botones, inputs, modales y tooltips (Buttons, Cards, Badges) asegurando consistencia visual y accesibilidad.
*   **DeleteReservaButton**: Verifica la lógica de confirmación antes de ejecutar la acción destructiva.

### 2.3. Tests de API (Integración Backend)
Validan los endpoints de la API (`/api/*`), simulando peticiones HTTP y verificando las respuestas, códigos de estado y efectos secundarios en la base de datos (mockeada).

*   **Autenticación**:
    *   `login.test.ts`: Verifica credenciales exitosas, fallidas y manejo de sesiones.
    *   `signup.test.ts`: Valida creación de usuarios y perfiles, y duplicidad de emails.
*   **Flujos Transaccionales**:
    *   `reservas.test.ts`: Simula el ciclo de vida completo de una reserva (creación, lectura, borrado).
    *   `create-checkout.test.ts`: Valida la integración con Lemon Squeezy, asegurando que se generen sesiones de pago con la metadata correcta.
    *   `webhook.test.ts`: **Crítico**. Valida la recepción de webhooks de pago, verificación de firma HMAC, y actualización atómica de estados en base de datos (pago -> pagado, reserva -> confirmada).
*   **Gestión de Recursos**:
    *   `recintos.test.ts`: CRUD administrativo de recintos.
    *   `cursos.test.ts`: Gestión de cursos por organizadores y validación de propiedad.

### 2.4. Tests de Integración de Páginas
Validan que las páginas completas (Paneles, Catálogos) carguen los datos correctos y muestren la interfaz adecuada según el rol.

*   **Paneles de Rol**: Verifican que `/admin`, `/worker`, `/organizer` y `/citizen` muestren la información específica de cada usuario.
*   **Catálogos Públicos**: Aseguran que los recintos y cursos activos se listen correctamente y que la búsqueda/filtrado funcione.

## 3. Justificación Académica de las Suites Críticas

### Suite de Detección de Conflictos
**Justificación**: La integridad de un sistema de reservas depende de evitar el "doble booking". Esta suite prueba matemáticamente la intersección de intervalos de tiempo, garantizando que es imposible reservar un recurso ya ocupado.

### Suite de Webhooks de Pago
**Justificación**: Es el punto más sensible del sistema, donde una entidad externa (Lemon Squeezy) modifica el estado del negocio. Se valida exhaustivamente la seguridad (firmas HMAC) y la idempotencia para evitar fraudes o inconsistencias financieras.

### Suites de Autenticación y RBAC
**Justificación**: Garantizan la seguridad del sistema. Se prueba no solo que los usuarios autorizados entren, sino, más importante, que los usuarios NO autorizados sean rechazados (Tests negativos).

## 4. Ejecución y Mantenimiento

Los tests están integrados en el flujo de desarrollo (CI/CD).
- Se ejecutan localmente antes de cada commit importante.
- El comando `npm test` ejecuta la batería completa.
- Se mantiene una política de "Zero Broken Tests" en la rama `main`.

---
*Este documento forma parte de la entrega técnica del TFG.*
