

# Plan: Sistema de estados, dependencias y regeneración (Prompts 1-3)

Prompt 1 ya está implementado y probado. El trabajo se divide en **5 partes secuenciales**.

---

## Parte 1: Migración de base de datos para estados por bloque

Agregar columna `block_states` (JSONB) y `version_history` (JSONB) a la tabla `episodes` para almacenar el estado de cada bloque y su historial de versiones.

```text
block_states: {
  "working_title": { "status": "generated", "updated_at": "...", "source_type": "ai_generated" },
  "theme":         { "status": "edited",    "updated_at": "...", "source_type": "edited" },
  ...
}

version_history: {
  "working_title": [{ "value": "...", "timestamp": "...", "source_type": "..." }],
  ...
}
```

---

## Parte 2: Sistema de estados y mapa de dependencias (Prompt 2 - lógica)

- Crear `src/lib/block-states.ts` con:
  - Constante `DEPENDENCY_MAP` con el grafo completo de dependencias
  - Tipos: `BlockStatus = 'empty' | 'generated' | 'edited' | 'approved' | 'stale' | 'blocked'`
  - Función `computeStaleBlocks(changedField, currentStates)` que propaga stale respetando la regla de proteccion de `approved`
  - Función `getBlockStatus(fieldName, episode)` que determina el estado de un campo
- Inicializar `block_states` al crear episodio en `Episodes.tsx` con status `generated` para los 8 campos que produce la IA

---

## Parte 3: UI de estados, badges y autosave (Prompt 2 - visual)

- Crear componente `BlockWrapper` que envuelve cada campo editable con:
  - Header con nombre del campo + badge de estado (colores: gris/azul/amarillo/verde/naranja parpadeante/rojo)
  - Mensaje de stale: "Este contenido quedó desactualizado porque [campo] cambió"
  - Botones placeholder: "Regenerar este bloque" / "Ignorar y mantener"
- Refactorizar `WorkspaceDataForm` para usar `BlockWrapper` en cada campo
- Implementar autosave con debounce de 2s usando `useCallback` + `setTimeout`
- Banner global en `EpisodeWorkspace` header: "X bloques desactualizados" cuando existan
- Indicador "Guardando..." / "Guardado" en el header

---

## Parte 4: Edge function de regeneración por bloque (Prompt 3 - backend)

- Crear o extender edge function `generate-episode-fields` para aceptar modo `regenerate_field`:
  - Recibe: `field_name`, `idea_principal`, todos los `datos_base` actuales
  - Usa el mismo system prompt AMTME
  - Retorna solo el campo solicitado
- Manejar errores 429/402

---

## Parte 5: Regeneración inteligente y aprobación (Prompt 3 - frontend)

- Conectar botón "Regenerar este bloque" a la edge function
- Estado de carga dentro del bloque durante regeneración
- Guardar versión anterior en `version_history` antes de sobrescribir
- Menú desplegable para ver historial y restaurar versiones
- Botón "Aprobar" por bloque que cambia estado a `approved`
- Botón global "Regenerar todo lo desactualizado" con:
  - Diálogo de confirmación mostrando conteo
  - Regeneración en orden de dependencia (datos_base → guion → derivados → prompts → assets → publicacion)
  - Protección de bloques aprobados con confirmación separada
- Regla final: nunca sobrescribir `approved` sin confirmar

---

## Orden de ejecución

| Parte | Depende de | Estimación |
|-------|-----------|------------|
| 1. Migración DB | Nada | Rápida |
| 2. Lógica estados | Parte 1 | Media |
| 3. UI estados + autosave | Partes 1+2 | Grande |
| 4. Edge function regen | Nada (paralelo a 2-3) | Media |
| 5. Regen + aprobación | Partes 2+3+4 | Grande |

Confirma y empiezo con la **Parte 1 + 2** juntas (migración + lógica de estados).

