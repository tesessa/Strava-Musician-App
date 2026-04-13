# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Start Everything
```bash
npm start              # Runs web (5173), backend (3001), and AI service (8000) concurrently
```

### Individual Services
```bash
npm run start:web      # React/Vite frontend on port 5173
npm run start:backend  # Next.js backend on port 3001
npm run start:ai       # Python FastAPI AI service on port 8000
```

### Build
```bash
npm run build          # Builds shared package, then web and backend
```

### Tests
```bash
npm run database_test  # Runs Jest tests with NODE_ENV=test (in-band, for DB integration tests)
```

### Backend Lint
```bash
cd apps/backend && npm run lint
```

### Shared Package (must rebuild after changes)
```bash
cd packages/shared && npm run build
```

## Architecture Overview

This is an **npm workspaces monorepo** with three apps and one shared package:

```
apps/web/        — React + Vite frontend (port 5173)
apps/backend/    — Next.js API server (port 3001)
apps/backend/ai/ — Python FastAPI audio/AI service (port 8000)
packages/shared/ — TypeScript types, enums, and constants shared between frontend and backend
```

The shared package is compiled to `packages/shared/dist/` and must be rebuilt (`npm run build` in that directory) after any changes before the apps will pick them up. The root `prestart` script does this automatically.

### Frontend (`apps/web`)

Follows a **component → service → network** layered architecture with dependency injection:

- **Components** handle display only; they receive server implementations via React context/props
- **Services** (`src/model/`) handle business logic and call network layer functions
- **Network** functions make HTTP requests to the backend

A `FakeDataServer` mode exists (enabled via `VITE_DEMO_MODE=true`) for running without a real backend. Every component at `src/components/**/*.tsx` or `src/pages/**/*.tsx` requires a mirror test at `test/` with the same path and `.test.tsx` extension.

### Backend (`apps/backend`)

Uses a **Handler → Service → DAO** layered pattern:

- **Handlers** (`src/api/handlers/`) — parse HTTP request, call service, return response
- **Services** (`src/api/services/`) — business logic, orchestrate across DAOs
- **DAOs** (`src/db/dao/`) — data access; two implementations behind a factory:
  - `supabase/` — production Supabase/PostgreSQL implementations
  - `inMemoryDaos/` — in-memory implementations for tests

The DAO factory pattern means implementations can be swapped without changing service code. Use `NODE_ENV=test` to activate test DAOs.

### AI Service (`apps/backend/ai`)

Python FastAPI service handling audio analysis and LLM features. Uses Essentia for audio processing and OpenAI for LLM integration. Has its own `venv` and `requirements.txt` in that directory.

## Key Conventions

### API Semantics
- HTTP 2xx = success; 4xx/5xx = failure — no JSON success flags
- Errors return `{ "error": "<code_or_message>" }`
- Successful deletes return 204 (no body)
- Feeds use **keyset pagination** (not offset): pass `lastItemId` + `pageSize` as query params

### Data Patterns
- Optimistic UI for creates/updates on the frontend — update local state before the server confirms
- Use Suspense + skeleton screens for data loading states
- Friends table stores relationships **bidirectionally** (two rows per pair)

### Environment Variables
Copy `.env.example` → `.env` at root, and `apps/web/.env.example` → `apps/web/.env`:

**Root `.env`:**
```
SUPABASE_CONNECTION=postgresql://...
SUPABASE_CONNECTION_TEST=postgresql://...
```

**`apps/web/.env`:**
```
VITE_DEMO_MODE=false
VITE_SERVER_URL=http://localhost:3001
VITE_ORACLE_NAMESPACE=...
VITE_ORACLE_REGION=us-phoenix-1
VITE_BUCKET_PROFILE_IMAGES=...
VITE_BUCKET_SESSION_AUDIO=...
VITE_BUCKET_SESSION_VIDEO=...
```

## Architecture Documentation

Detailed architecture docs live in `docs/`:
- `KODA-Frontend-Architecture.md` — component/service patterns, dependency injection, optimistic UI
- `KODA-Backend-Architecture.md` — handler/service/DAO patterns, request flow
- `KODA-Data-Model-and-Storage.md` — table schemas, ID conventions, media storage
- `KODA-API-Surface.md` — complete endpoint contracts
- `KODA-Key-Flows-and-UX.md` — user flows and frontend-backend interactions
