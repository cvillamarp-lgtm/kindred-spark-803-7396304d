# AMTME OS — A Mi Tampoco Me Explicaron

Sistema de gestión integral para la producción del podcast **AMTME**.

## Stack tecnológico

- React 18 + TypeScript + Vite
- Supabase (Auth + Base de datos + Edge Functions)
- TailwindCSS + shadcn/ui
- TanStack React Query

## Funcionalidades

- Dashboard con KPIs de producción
- Gestión de episodios, invitados y tareas
- Calendario editorial
- Generador de guiones con IA (streaming)
- Generador de prompts visuales
- Brand Studio y Design Studio
- Métricas, audiencia y menciones
- Scorecard de rendimiento

## Setup local

### 1. Clonar el repositorio

```sh
git clone https://github.com/cvillamarp-lgtm/kindred-spark-803-7396304d.git
cd kindred-spark-803-7396304d
```

### 2. Configurar variables de entorno

```sh
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase (disponibles en [dashboard.supabase.com](https://dashboard.supabase.com) → Settings → API).

### 3. Instalar dependencias

```sh
bun install
```

### 4. Iniciar servidor de desarrollo

```sh
bun run dev
```

## Despliegue

El proyecto se puede desplegar en [Lovable](https://lovable.dev) o cualquier plataforma compatible con Vite (Vercel, Netlify, etc.).
