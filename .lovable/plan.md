

# Plataforma de Creación de Contenido Todo-en-Uno

Transformar la Fábrica de Contenido de un generador de prompts a una plataforma completa donde todo el flujo ocurre sin salir de la app.

## Cambios principales

### 1. Nueva tabla `content_assets` para gestión de assets
Almacenar cada pieza generada vinculada a un episodio.

```sql
CREATE TABLE public.content_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE SET NULL,
  piece_id integer NOT NULL,        -- 1-15
  piece_name text NOT NULL,
  image_url text,                   -- URL de imagen generada
  caption text,                     -- Copy/caption para redes
  hashtags text,                    -- Hashtags generados
  prompt_used text,                 -- Prompt que generó la imagen
  status text DEFAULT 'pending',    -- pending | generated | approved | published
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: user_id = auth.uid() para CRUD
-- Trigger update_updated_at_column
```

### 2. Edge Function `generate-captions` (nueva)
Genera captions + hashtags para cada pieza basado en el copy y contexto del episodio. Usa Lovable AI (`google/gemini-3-flash-preview`). Devuelve caption editorial + hashtags relevantes para cada pieza.

### 3. Rediseño de ContentFactory.tsx — 4 tabs

**Tab 1: Entrada** (existente, sin cambios)
- Datos del episodio + guión

**Tab 2: Piezas** (existente, mejorado)
- Lista de 15 piezas con copy editable
- Nuevo botón **"Generar imagen"** en cada pieza que llama a `generate-image` directamente con el prompt construido
- Muestra la imagen generada inline con opciones de regenerar/editar
- Indicador de estado por pieza (pendiente/generado/aprobado)

**Tab 3: Captions** (nuevo)
- Botón "Generar captions para todas las piezas" que llama a la nueva edge function
- Editor de caption + hashtags por pieza
- Preview de cómo se vería el post (imagen + caption)

**Tab 4: Biblioteca** (nuevo)
- Galería de todos los assets generados, filtrable por episodio
- Vista de grid con thumbnails
- Estados: pendiente → generado → aprobado → publicado
- Acciones: descargar, aprobar, eliminar

### 4. Flujo end-to-end automatizado
Nuevo botón "Producir Todo" que ejecuta secuencialmente:
1. Extraer contenido (extract-content)
2. Generar captions (generate-captions)
3. Generar imágenes pieza por pieza (generate-image) con barra de progreso
4. Guardar todo en `content_assets`

### 5. Página de Biblioteca global (nueva ruta `/library`)
- Vista centralizada de todos los assets de todos los episodios
- Filtros por episodio, tipo de pieza, estado
- Navegación añadida al sidebar en grupo "Herramientas"

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `content_assets` table | Migración SQL |
| `supabase/functions/generate-captions/index.ts` | Crear |
| `supabase/config.toml` | Añadir function |
| `src/pages/ContentFactory.tsx` | Rediseño completo con 4 tabs |
| `src/pages/Library.tsx` | Crear |
| `src/components/factory/*` | Componentes: PieceCard, CaptionEditor, AssetGallery, ProgressTracker |
| `src/App.tsx` | Añadir ruta `/library` |
| `src/components/AppSidebar.tsx` | Añadir "Biblioteca" al nav |

## Orden de implementación

Dado el alcance, se implementará en 2-3 mensajes:
1. **Mensaje 1**: Tabla + edge function captions + ContentFactory rediseñado con generación de imágenes inline
2. **Mensaje 2**: Biblioteca global + flujo automatizado "Producir Todo"

