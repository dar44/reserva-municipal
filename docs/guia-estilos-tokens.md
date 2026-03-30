# Guía de Estilos y Design Tokens

Esta guía documenta el sistema de diseño implementado en el proyecto, basado en **Tailwind CSS v4** y variables CSS nativas para soportar tematización dinámica (Modo Claro / Oscuro).

## 1. Paleta de Colores

El sistema utiliza una paleta semántica. No usamos colores "hardcoded" (ej: `bg-blue-500`), sino tokens funcionales (ej: `bg-primary`).

### Colores Principales (Brand)
Usados para acciones principales, botones y estados activos.

| Token | Variable CSS | Uso |
|-------|--------------|-----|
| `primary` | `--primary` | Color principal de la marca (Azul Institucional). |
| `primary-foreground` | `--primary-foreground` | Texto sobre fondo primario (Blanco). |

### Colores de Superticie (Fondos)
Adaptables según el modo (Claro/Oscuro).

| Token | Variable CSS | Uso |
|-------|--------------|-----|
| `background` | `--background` | Fondo general de la página. |
| `foreground` | `--foreground` | Texto principal. |
| `card` | `--card` | Fondo de tarjetas y paneles. |
| `popover` | `--popover` | Fondo de menús flotantes y modales. |
| `muted` | `--muted` | Fondos secundarios (ej: áreas de relleno). |

### Estados y Feedback
Colores semánticos para comunicar estado.

| Token | Variable CSS | Uso |
|-------|--------------|-----|
| `destructive` | `--destructive` | Acciones peligrosas (Eliminar, Cancelar). Rojo. |
| `success` | (Tailwind `green-600`) | Mensajes de éxito y confirmación. |
| `warning` | (Tailwind `amber-500`) | Advertencias no bloqueantes. |

---

## 2. Tipografía

Se utiliza la familia tipográfica del sistema (**Inter** / San Francisco / Segoe UI) para máxima legibilidad y rendimiento.

| Clase | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `text-4xl` | 2.25rem | Bold | Títulos principales (H1). |
| `text-2xl` | 1.5rem | Semibold | Títulos de sección (H2). |
| `text-lg` | 1.125rem | Medium | Destacados y subtítulos. |
| `text-base` | 1rem | Regular | Cuerpo de texto general. |
| `text-sm` | 0.875rem | Regular | Metadatos, etiquetas y captions. |

---

## 3. Espaciado y Layout

El sistema utiliza la escala espacial de Tailwind (multiplos de 4px).

- **Contenedor Principal**: `container mx-auto px-4` (Centrado con padding lateral).
- **Tarjetas**: `p-6` (Padding interno estándar).
- **Listas**: `gap-4` (Espacio entre elementos grid/flex).
- **Secciones**: `py-10` (Espaciado vertical entre bloques de contenido).

---

## 4. Componentes Base (UI Kit)

### Botones (`components/ui/button.tsx`)
Variantes disponibles:
- **Default**: Fondo primario, texto blanco. Acción principal.
- **Destructive**: Fondo rojo. Eliminar/Cancelar.
- **Outline**: Bordeado, fondo transparente. Acciones secundarias.
- **Ghost**: Sin fondo ni borde. Iconos y menús.

### Tarjetas (`components/ui/card.tsx`)
Estructura estándar para agrupar contenido:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Subtítulo</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido principal...
  </CardContent>
  <CardFooter>
    Acciones...
  </CardFooter>
</Card>
```

### Inputs (`components/ui/input.tsx`)
Estilos unificados con estados de foco (`ring-offset`), error y deshabilitado. Soporte nativo para modo oscuro.

---

## 5. Implementación Técnica

Los tokens se definen en `app/globals.css` utilizando la directiva `@theme` de Tailwind v4:

```css
@theme {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... resto de variables ... */
}
```

Las variables CSS se inyectan en el `:root` y se modifican bajo la clase `.dark` para soportar el cambio de tema instantáneo.
