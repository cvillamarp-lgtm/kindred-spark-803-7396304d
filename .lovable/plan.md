

# Mejoras y Optimizaciones para AMTME OS

Tras revisar toda la aplicación, identifico mejoras organizadas por impacto y categoría.

---

## 1. UX/UI - Mejoras de experiencia

### 1A. Dashboard mejorado con actividad reciente y accesos rápidos
El Dashboard actual solo muestra contadores y listas. Se puede agregar:
- Acceso rápido a "Producir Todo" desde el episodio más reciente
- Indicador de assets generados vs pendientes por episodio
- Timeline de actividad reciente (últimos assets, captions, imágenes)

### 1B. Episodios - Vista detalle con progreso visual
Agregar una vista de detalle por episodio que muestre:
- Barra de progreso de producción (guión, extracción, imágenes, captions, publicado)
- Preview de las piezas generadas para ese episodio
- Botón directo "Ir a Fábrica" con datos pre-cargados

### 1C. Biblioteca con vista previa expandida
La Biblioteca actual es básica. Mejorar con:
- Modal de preview full-size al hacer click en una imagen
- Copiar caption + hashtags con un click
- Descarga masiva (ZIP) de todas las piezas de un episodio
- Filtro por episodio vinculado

### 1D. Sidebar con indicadores de estado
Mostrar badges en el sidebar indicando items pendientes (tareas, assets sin aprobar).

---

## 2. Producción - Flujo de contenido

### 2A. Selector de piezas en "Producir Todo"
Actualmente genera las 15 piezas obligatoriamente. Permitir seleccionar cuáles generar (checkboxes) para ahorrar créditos y tiempo.

### 2B. Cola de reintentos automáticos
Si una imagen falla (rate limit, timeout), agregarla a una cola de reintentos en lugar de saltarla silenciosamente.

### 2C. Historial de versiones por pieza
Guardar todas las versiones generadas (no solo la última) para poder comparar y elegir la mejor.

### 2D. Vinculación Episodio-Assets automática
Al usar "Producir Todo", vincular automáticamente los assets al episodio usando `episode_id` (actualmente se deja null).

---

## 3. Backend - Robustez y datos

### 3A. Índices en content_assets
Agregar índices en `user_id`, `episode_id` y `status` para consultas rápidas.

### 3B. Upsert en lugar de insert para assets
Al guardar assets, usar upsert por `(user_id, piece_id, episode_id)` para evitar duplicados cuando se regenera.

### 3C. Constraint unique para evitar duplicados
Agregar constraint `UNIQUE(user_id, piece_id, episode_id)` en `content_assets`.

---

## 4. Rendimiento

### 4A. Caché de extracción
Si el guión no cambió, no volver a llamar a `extract-content`. Usar un hash del script como clave de caché.

### 4B. Lazy load de imágenes en galería
Las imágenes de la biblioteca cargan todas de golpe. Usar `loading="lazy"` y virtualización para listas largas.

### 4C. Prefetch del tab siguiente
Cuando el usuario está en "Entrada", prefetch la estructura de "Piezas" para transición instantánea.

---

## 5. Nuevas funcionalidades

### 5A. Exportación de paquete completo
Botón "Exportar episodio" que genera un ZIP con todas las imágenes + un archivo de texto con todos los captions y hashtags listos para copiar/pegar.

### 5B. Programación de publicación
Integrar con el Calendario Editorial: al aprobar un asset, poder asignarle una fecha de publicación que aparezca en el calendario.

### 5C. Plantillas de caption personalizables
Permitir al usuario definir su propio estilo de caption (tono, longitud, estructura) que se inyecte en el prompt de `generate-captions`.

---

## Orden de implementación sugerido

| Prioridad | Mejora | Impacto |
|---|---|---|
| Alta | 2A - Selector de piezas | Ahorro de créditos |
| Alta | 2D - Vinculación episodio-assets | Datos organizados |
| Alta | 3B/3C - Upsert + unique constraint | Evita duplicados |
| Media | 1B - Vista detalle episodio | UX |
| Media | 1C - Biblioteca mejorada | UX |
| Media | 2B - Cola de reintentos | Robustez |
| Media | 5A - Exportación ZIP | Productividad |
| Baja | 1D - Badges sidebar | UX polish |
| Baja | 4A - Caché extracción | Performance |
| Baja | 5B - Programación publicación | Feature |

