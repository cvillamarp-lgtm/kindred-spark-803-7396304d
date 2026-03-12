

# Plan: Auditoría y Endurecimiento Técnico AMTME OS

## Alcance

12 áreas de intervención (A-L), priorizadas por riesgo. Cambios quirúrgicos, sin rediseño.

---

## A. Documento privado expuesto en `public/`

**Problema**: `public/data/master-document.md` es accesible sin auth en cualquier deploy.

**Cambios**:
1. Eliminar `public/data/master-document.md` del directorio público
2. Crear tabla `private_documents` con RLS (solo el usuario dueño puede leer)
3. Migración: tabla con columnas `id`, `user_id`, `name`, `content` (text), `created_at`
4. RLS: SELECT/INSERT/UPDATE/DELETE solo donde `auth.uid() = user_id`
5. Actualizar `src/pages/Import.tsx`: en vez de `fetch("/data/master-document.md")`, leer desde la tabla con sesión autenticada
6. Agregar botón de upload en Import para que el usuario suba el documento a la tabla (ya no se sirve estáticamente)

---

## B. Edge Functions sin cierre real de auth

**Problema**: `verify_jwt = false` en config.toml, y `extract-content`, `generate-captions`, `generate-episode-fields` ya fueron parcheados en el mensaje anterior.

**Cambios**: Verificar que las 5 funciones ya tienen validación de JWT via `getClaims()` en código. Según la revisión actual, las 5 ya lo tienen. Solo documentar que `verify_jwt = false` es intencional (signing-keys pattern). No hay cambio adicional necesario.

---

## C. Vulnerabilidad cross-tenant en `generate-image`

**Problema**: `episodeId` update usa service role sin validar ownership.

**Cambios** en `supabase/functions/generate-image/index.ts`:
1. Extraer `userId` del JWT claims (`claimsData.claims.sub`)
2. Antes del update, verificar ownership: query el episodio con cliente autenticado y confirmar que `user_id` coincide
3. El update solo procede si el episodio pertenece al usuario autenticado
4. Alternativa más simple: hacer el update con el cliente autenticado (no service role), así RLS lo protege automáticamente

---

## D. Migraciones duplicadas

**Problema**: `001_initial_schema.sql` y `20260308125507_*.sql` ambos crean las mismas tablas base.

**Cambios**:
1. Eliminar `001_initial_schema.sql` (es el duplicado original, la segunda migración es la que realmente se ejecutó)
2. Agregar comentario en la segunda migración indicando que es el baseline
3. Documentar en README que las migraciones son incrementales desde `20260308125507`

---

## E. Bug de producción con asset en Vite

**Problema**: `ContentPipeline.tsx` hace `fetch("/src/assets/host-reference.png")` — no funciona en producción.

**Cambios** en `src/pages/ContentPipeline.tsx`:
1. Importar el asset: `import hostReferencePng from "@/assets/host-reference.png"`
2. Usar la URL resuelta por Vite en `loadHostBase64`: `fetch(hostReferencePng)`

---

## F. Doble invocación de `generate-script`

**Problema**: En `ContentPipeline.tsx`, líneas 52-69, primero se invoca via `supabase.functions.invoke()` y luego via `fetch()` directo — doble consumo de IA.

**Cambios** en `src/pages/ContentPipeline.tsx`:
1. Eliminar la primera invocación (`supabase.functions.invoke`) ya que no se usa su respuesta para streaming
2. Mantener solo el `fetch()` directo que lee el stream SSE
3. Resultado: una sola llamada, streaming preservado

---

## G. URLs hardcodeadas a proyecto Supabase

**Problema**: `knjhhmqthkpucfxpdhxj.supabase.co` en `generate-image/index.ts` y `visual-templates.ts`.

**Cambios**:
1. En `generate-image/index.ts`: reemplazar URLs hardcodeadas por `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/generated-images/host-imagen01.png`
2. En `src/lib/visual-templates.ts`: reemplazar por `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/generated-images/host-imagen01.png` — pero como es una constante estática, usar una función `getHostReferenceUrl(key)` que construye la URL dinámicamente

---

## H. Endurecer TypeScript

**Cambios graduales** (sin refactor masivo):
1. Activar `strictNullChecks` en `tsconfig.app.json` — NO, demasiado disruptivo
2. En su lugar: agregar tipos explícitos en los hotspots críticos:
   - `src/hooks/useEpisode.ts`: tipar retorno de queries
   - `src/pages/ContentFactory.tsx`: tipar `data` de supabase responses
   - Edge function payloads: ya están tipados con destructuring
3. Reemplazar usos de `(data as any)` en ContentFactory con tipos del schema

---

## I. Integridad de datos

**Cambios**:
1. Migración: agregar FK de `content_assets.episode_id` → `episodes.id` ON DELETE SET NULL (si no existe)
2. Migración: agregar FK de `tasks.episode_id` → `episodes.id` ON DELETE SET NULL (si no existe)
3. No alterar `user_id` nullable en tablas existentes para no romper datos — solo documentar como deuda

---

## J. Refactorización ContentFactory.tsx (842 líneas)

**Cambios**:
1. Extraer lógica de producción (generateAll, saveAssets) a `src/hooks/useContentProduction.ts`
2. Extraer lógica de extracción a `src/hooks/useContentExtraction.ts` (ya existe parcialmente)
3. El componente queda como orquestador de UI, delegando lógica a hooks
4. Sin cambios en comportamiento

---

## K. Documentación

**Cambios**:
1. Actualizar `README.md` con secciones completas: variables frontend, secrets de edge functions, despliegue, archivos sensibles
2. Actualizar `.env.example` con todas las variables necesarias
3. Documentar que `LOVABLE_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` son inyectados automáticamente

---

## L. Tests mínimos

**Cambios**:
1. `src/test/document-parser.test.ts`: tests para `parseDocument`, `computeStats`, `parseRenumberedEpisodes`
2. `src/test/block-states.test.ts`: tests para `computeStaleBlocks`, `initBlockStatesFromAI`, `addVersionEntry`
3. `src/test/visual-templates.test.ts`: test para `buildPiecePrompt` — verifica que no incluye URLs hardcodeadas

---

## Orden de ejecución

| Prioridad | Items | Archivos principales |
|-----------|-------|---------------------|
| 1 (seguridad) | A, C | Import.tsx, generate-image, migración |
| 2 (bugs prod) | E, F, G | ContentPipeline.tsx, visual-templates.ts, generate-image |
| 3 (estabilidad) | D, I | migraciones |
| 4 (higiene) | H, J, K, L | ContentFactory.tsx, README, tests |

B ya está resuelto de mensajes anteriores — solo verificación.

