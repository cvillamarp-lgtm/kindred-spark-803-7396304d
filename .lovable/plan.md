

# Auditoría Completa — AMTME OS

## Arbol del proyecto (archivos relevantes)

```text
├── supabase/
│   ├── config.toml                    [AUTO-GENERATED]
│   ├── functions/
│   │   ├── extract-content/index.ts   [CRITICO] Edge function IA
│   │   ├── generate-captions/index.ts [CRITICO] Edge function IA
│   │   ├── generate-episode-fields/   [CRITICO] Edge function IA
│   │   ├── generate-image/index.ts    [CRITICO] Edge function IA
│   │   └── generate-script/index.ts   [CRITICO] Edge function IA (SSE)
│   └── migrations/ (12 archivos)
│       ├── 001_initial_schema.sql     [LEGACY/MUERTO]
│       └── 20260308…–20260312… (11)   [ACTIVAS]
├── src/
│   ├── main.tsx                       [CRITICO] Entry point
│   ├── App.tsx                        [CRITICO] Router + providers
│   ├── index.css / App.css            Estilos globales
│   ├── integrations/supabase/
│   │   ├── client.ts                  [AUTO-GENERATED]
│   │   └── types.ts                   [AUTO-GENERATED]
│   ├── pages/ (25 archivos)
│   │   ├── Auth.tsx                   [CRITICO]
│   │   ├── Index.tsx                  Dashboard
│   │   ├── Episodes.tsx               Lista episodios
│   │   ├── EpisodeWorkspace.tsx       [CRITICO] Workspace principal
│   │   ├── ContentFactory.tsx         [CRITICO] Fábrica visual
│   │   ├── Library.tsx                Biblioteca de assets
│   │   ├── Templates.tsx              Templates de episodio
│   │   ├── Metrics.tsx                Métricas
│   │   ├── Tasks.tsx                  Gestión de tareas
│   │   ├── System.tsx                 Config sistema
│   │   ├── Resources.tsx              Recursos
│   │   ├── Import.tsx                 Importación datos
│   │   ├── Audience.tsx               [ARCHIVADO] en nav
│   │   ├── Guests.tsx                 [ARCHIVADO]
│   │   ├── Mentions.tsx               [ARCHIVADO]
│   │   ├── Scorecard.tsx              [ARCHIVADO]
│   │   ├── EditorialCalendar.tsx      [ARCHIVADO]
│   │   ├── ContentPipeline.tsx        ⚠️ HUERFANO (sin ruta)
│   │   ├── EpisodeDetail.tsx          ⚠️ HUERFANO (sin ruta)
│   │   ├── BrandStudio.tsx            ⚠️ HUERFANO (sin ruta)
│   │   ├── DesignStudio.tsx           ⚠️ HUERFANO (sin ruta)
│   │   ├── ScriptGenerator.tsx        ⚠️ HUERFANO (sin ruta)
│   │   ├── PromptBuilder.tsx          ⚠️ HUERFANO (sin ruta)
│   │   └── VisualPromptGenerator.tsx  ⚠️ HUERFANO (sin ruta)
│   ├── components/
│   │   ├── AppLayout.tsx              [CRITICO]
│   │   ├── AppSidebar.tsx             [CRITICO] Navegación
│   │   ├── ProtectedRoute.tsx         [CRITICO] Auth guard
│   │   ├── ErrorBoundary.tsx          Error handling
│   │   ├── EmptyState.tsx / LoadingSkeleton.tsx / NavLink.tsx / PageHeader.tsx
│   │   ├── brand/  (3 archivos)       Usados por BrandStudio (huérfano)
│   │   ├── factory/ (5 archivos)      [CRITICO] Fábrica visual
│   │   ├── library/ (1 archivo)       Modal preview assets
│   │   ├── sidebar/ (1 archivo)       Badges conteo
│   │   ├── workspace/ (5 archivos)    [CRITICO] Bloques workspace
│   │   └── ui/ (50+ archivos)         shadcn/ui
│   ├── hooks/ (8 archivos)
│   │   ├── useAuth.tsx                [CRITICO]
│   │   ├── useEpisode.ts             [CRITICO]
│   │   ├── useContentProduction.ts   [CRITICO]
│   │   ├── useContentExtraction.ts
│   │   ├── usePiezas.ts
│   │   ├── useSupabaseQuery.ts
│   │   ├── use-mobile.tsx / use-toast.ts
│   └── lib/
│       ├── types/pieza.ts             Tipos design system
│       ├── visual-templates.ts        [CRITICO] Prompts IA
│       ├── master-template.ts         [CRITICO] Template producción
│       ├── block-states.ts            Estados bloques workspace
│       ├── brand-system-data.ts       Usado por BrandStudio
│       ├── design-utils.ts            Usado por DesignStudio
│       ├── document-parser.ts         Parser documentos
│       ├── episode-validation.ts      Validación episodios
│       ├── import-engine.ts           Motor importación
│       └── utils.ts                   cn() utility
├── public/data/piezas.json            Data estática design system
└── configuración: vite.config.ts, tailwind.config.ts, tsconfig*.json, etc.
```

---

## Hallazgos Criticos

### 1. PAGINAS HUERFANAS (7 archivos, ~2,700 lineas de codigo muerto)

Estas paginas **existen en el filesystem pero NO tienen ruta en App.tsx** ni estan importadas en ningun lugar:

| Archivo | Lineas | Estado |
|---------|--------|--------|
| `ContentPipeline.tsx` | 485 | Sin ruta, sin import |
| `EpisodeDetail.tsx` | 300 | Sin ruta, sin import |
| `BrandStudio.tsx` | 156 | Sin ruta, sin import |
| `DesignStudio.tsx` | 449 | Sin ruta, sin import |
| `ScriptGenerator.tsx` | 169 | Sin ruta, sin import |
| `PromptBuilder.tsx` | 495 | Sin ruta, sin import |
| `VisualPromptGenerator.tsx` | 540 | Sin ruta, sin import |

**Impacto**: Codigo inaccesible. No afecta al bundle (lazy loading no las importa), pero es deuda tecnica significativa. Algunas (ContentPipeline, PromptBuilder) tienen funcionalidad que podria ser valiosa si se reactiva.

### 2. CODIGO DUPLICADO

- **JSZip download logic**: Duplicada en 3 archivos (`Library.tsx`, `EpisodeDetail.tsx`, `WorkspaceAssets.tsx`). Deberia extraerse a un hook `useZipExport`.
- **EpisodeDetail.tsx vs EpisodeWorkspace.tsx**: Ambas son vistas de detalle de episodio. `EpisodeDetail` parece ser la version anterior reemplazada por `EpisodeWorkspace`.

### 3. SEGURIDAD — RLS Policies

- Tablas `audience_members`, `brand_assets`, `episode_templates`, `guests`, `mentions`, `metrics`, `resources`, `generation_history` usan `Roles: {public}` en vez de `{authenticated}`. Esto significa que el filtro `auth.uid() = user_id` funciona, pero la policy esta abierta a roles no autenticados (aunque `auth.uid()` retorna null para anon, el patron correcto es `{authenticated}`).
- Las tablas `content_assets` y `private_documents` SI usan `{authenticated}` correctamente.

### 4. MIGRACION LEGACY

- `001_initial_schema.sql` es un artefacto legacy segun el README. No afecta funcionalidad pero podria causar confusion.

### 5. DEUDA TECNICA MENOR

- `src/lib/types/pieza.ts` define tipos extensos que tambien podrian derivarse del JSON en `public/data/piezas.json`.
- `brand-system-data.ts` y `design-utils.ts` solo se usan desde paginas huerfanas (BrandStudio, DesignStudio). Si esas paginas se eliminan, estos archivos tambien son muertos.
- El hook `useSupabaseQuery.ts` podria ser redundante con TanStack Query patterns ya usados directamente.

---

## Plan de Accion Recomendado

### Opcion A: Limpieza (eliminar codigo muerto)
Eliminar las 7 paginas huerfanas y sus dependencias exclusivas. Reduce ~3,000+ lineas de deuda tecnica.

### Opcion B: Reactivacion (reconectar rutas)
Agregar las rutas faltantes a `App.tsx` y enlaces al sidebar para paginas que tengan valor funcional (BrandStudio, DesignStudio, PromptBuilder, ScriptGenerator).

### Opcion C: Mixto
- Reactivar: BrandStudio, DesignStudio, ScriptGenerator (funcionalidad util)
- Eliminar: ContentPipeline (reemplazada por ContentFactory), EpisodeDetail (reemplazada por EpisodeWorkspace), VisualPromptGenerator (posible duplicado de PromptBuilder)

### Correccion de seguridad (independiente)
Cambiar las RLS policies de 8 tablas de `Roles: {public}` a `Roles: {authenticated}`.

### Refactor de duplicados (independiente)
Extraer logica de ZIP export a un hook compartido.

