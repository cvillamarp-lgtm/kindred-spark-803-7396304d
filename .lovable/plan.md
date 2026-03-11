

## Análisis del Blueprint vs Estado Actual

He revisado el documento completo. Tu Blueprint describe 9 módulos con esquemas de base de datos detallados, flujos de trabajo y especificaciones de pantalla. Comparándolo con lo que ya tienes construido, identifiqué las brechas más valiosas para mejorar la app.

---

### Lo que YA está cubierto

| Módulo Blueprint | Estado actual |
|---|---|
| M1 — Catálogo de episodios | Funcional (tabla `episodes` con CRUD) |
| M4 — Tareas y checklist | Funcional (tabla `tasks` con CRUD) |
| M5 — Identidad de marca | Parcial (Brand Studio + `brand_assets`) |
| M6 — Calendario editorial | Funcional (página `/calendar`) |
| Métricas básicas | Funcional (tabla `metrics` + página) |
| Audiencia | Funcional (tabla `audience_members`) |

---

### Brechas con mayor impacto (ordenadas por prioridad)

#### 1. Enriquecer tabla `episodes` con campos del Blueprint
La tabla actual le faltan campos clave que el Blueprint especifica: `link_spotify`, `descripcion_spotify`, `nivel_completitud` (A/B/C/D), `estado_validacion`, `conflicto`, `streams_total`, campos de retención (Q1-Q4), `fecha_es_estimada`, `titulo_original`, `nota_trazabilidad`.

**Cambio:** Migración SQL para agregar ~12 columnas. Actualizar el formulario de Episodes para mostrar/editar estos campos nuevos. Agregar badges de nivel y alertas de conflicto en la vista de lista.

#### 2. Tabla `assets_ig` por episodio
El Blueprint define una tabla relacionada con `episodes` para guardar caption IG, 6 slides de carrusel, story de lanzamiento y evergreen por episodio. Actualmente no existe.

**Cambio:** Nueva tabla `assets_ig` con FK a `episodes`. UI de tab/sección dentro del detalle de cada episodio para gestionar los assets IG.

#### 3. Dashboard mejorado con KPIs del Blueprint
El Blueprint especifica: alertas de conflictos activos, tareas urgentes, gráfico de nivel de completitud (A/B/C/D), gráfico de retención top 10, KPI de conversión IG→Spotify.

**Cambio:** Agregar secciones al Dashboard: lista de episodios con `conflicto=true`, chart de barras por nivel de completitud, top 10 retención.

#### 4. Tabla `log_cambios` (auditoría automática)
El Blueprint define un log de auditoría que registra cada edición: tabla afectada, campo modificado, valor anterior/nuevo, usuario, fecha.

**Cambio:** Nueva tabla `log_cambios` + trigger en PostgreSQL que registra cambios automáticamente en `episodes`. Página simple de consulta del log.

#### 5. Exportación CSV/PDF
El Blueprint pide exportar el catálogo como CSV con un clic.

**Cambio:** Botón "Exportar CSV" en la página de Episodios que genera y descarga un archivo con todos los campos.

---

### Plan de implementación recomendado

Dado el volumen, recomiendo hacerlo en **3 fases** para no romper nada:

**Fase A (inmediata):** Enriquecer `episodes` + actualizar UI de episodios con los campos nuevos + badges de nivel/conflicto.

**Fase B:** Crear `assets_ig` + UI de assets IG por episodio + Dashboard mejorado con alertas y charts.

**Fase C:** `log_cambios` con triggers + exportación CSV.

---

### Pregunta antes de empezar

¿Quieres que empiece con la **Fase A** (enriquecer episodios con todos los campos del Blueprint), o prefieres priorizar otro módulo?

