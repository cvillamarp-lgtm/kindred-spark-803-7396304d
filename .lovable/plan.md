

## Plan: Corregir config.toml y agregar validación de auth en edge functions

### Problema actual
El `config.toml` tiene `verify_jwt = true`, lo cual no funciona con el sistema de signing-keys de Lovable Cloud y romperá las llamadas a las edge functions (retornará 401).

### Cambios

**1. Revertir `config.toml`** a `verify_jwt = false` (el archivo es autogenerado, pero necesita este valor para funcionar).

**2. Agregar validación de autenticación en código** dentro de ambas edge functions (`generate-script` y `generate-image`):
- Verificar que el header `Authorization` existe y tiene formato `Bearer <token>`
- Usar `supabase.auth.getClaims(token)` para validar el JWT
- Retornar 401 si no es válido
- Esto protege los endpoints sin depender del flag `verify_jwt`

**3. Archivos a modificar:**
- `supabase/config.toml` — cambiar `verify_jwt` a `false`
- `supabase/functions/generate-script/index.ts` — agregar bloque de auth al inicio del handler
- `supabase/functions/generate-image/index.ts` — agregar bloque de auth al inicio del handler (ya importa `createClient`, solo necesita el check)

Los cambios de `.gitignore` y `README.md` ya se aplicaron en el último diff, no requieren más acción.

