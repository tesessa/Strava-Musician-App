 # Koda Architecture Non‑Alignment Report

This document summarizes areas where the current implementation diverges from the intended architecture defined in `docs/KODA-Architecture-and-Design.md`.  
Snapshot as of **2026‑03‑02**.

---

## Frontend

### 1. Frontend services do not mirror backend services

- **Design expectation**
  - Frontend services should closely mirror backend services (Auth, User, PracticeSession, Event, Challenge) in both naming and function signatures.
  - A single `KodaServerApi` interface should expose the backend API surface.
- **Current implementation**
  - `apps/web/src/model/network/KodaServerApi.ts` only defines:
    - `getMe`, `login`, `register`
    - `savePost`, `discardPost`
  - Frontend services:
    - `apps/web/src/model/service/UserService.ts` (auth/user)
    - `apps/web/src/model/service/PostService.ts` (practice post)
  - Backend services:
    - `apps/backend/src/api/services/authServices.ts` (`AuthService`)
    - `apps/backend/src/api/services/userServices.ts` (`UserService`)
    - `apps/backend/src/api/services/sessionServices.ts` (`SessionService`)
  - Missing frontend counterparts for:
    - Session feed / session CRUD (`SessionService`)
    - Friends, friend requests
    - Challenges, notifications
    - Events / calendar
    - Likes, comments, media, unified search, stats, etc.
- **Impact**
  - The service layer is **not yet parallel** between frontend and backend, contrary to the architecture’s “mirrored services” guideline.

### 2. Client Communicator layer not implemented

- **Design expectation**
  - `ServerFacade` should use a dedicated **Client Communicator** for HTTP concerns, with `KodaServerApi` being a pure interface for the app.
- **Current implementation**
  - `apps/web/src/model/network/ServerFacade.ts` implements `KodaServerApi` but:
    - Contains only stubs (no real HTTP calls).
    - Does **not** delegate to a separate Client Communicator module.
- **Impact**
  - HTTP concerns are not cleanly separated into a dedicated Client Communicator as described; the `ServerFacade` is currently a stub instead of the intended layered design.

### 3. Feed / Home page not wired to `/sessions/feed` or keyset pagination

- **Design expectation**
  - The Home feed should:
    - Call `GET /sessions/feed` using keyset pagination on `createdAt` (`{ lastItem, pageSize }`).
    - Implement infinite scroll for the practice session feed.
- **Current implementation**
  - `apps/web/src/pages/Home.tsx`:
    - Uses **hard-coded `Post` data** in component state.
    - Performs only local filtering (instrument + text search).
    - Does **not** call any service or `KodaServerApi` method for the feed.
    - Does **not** implement infinite scroll or keyset pagination.
- **Impact**
  - The Home feed currently behaves as a static demo screen, not the service‑backed, paginated feed specified by the architecture.

### 4. Calendar uses local storage instead of Events API / services

- **Design expectation**
  - Calendar events should be backed by the `Events` table and `Events` API:
    - `POST /events`, `GET /events/:month`, `GET /events/:eventId`, `PATCH /events/:eventId`, `DELETE /events/:eventId`.
  - Event types should align with the specified enum: `eventType (practice | lesson | performance)`.
- **Current implementation**
  - `apps/web/src/pages/calendar.tsx`:
    - Stores events and practice history in **`localStorage`** under `"calendar-events"`.
    - Uses a local `EventType` union: `"Recital" | "Concert" | "Other" | "Practice"`.
    - Does not call any backend service or `KodaServerApi` method.
  - No dedicated `EventService` on the frontend, and no `KodaServerApi` methods for events.
- **Impact**
  - Calendar and practice history are implemented as a **local-only feature** and do not use the shared data model, enums, or API surface defined in the architecture.

### 5. Practice timer and media logic live in UI hooks instead of service layer + backend timer

- **Design expectation**
  - Session timer:
    - Backend is the **source of truth**; frontend sends `startTimer`, `syncTimer`, `stopTimer`.
    - Timer state is synchronized between frontend and backend.
  - Business logic and data manipulation should live in services, not in UI components.
- **Current implementation**
  - `apps/web/src/components/practice/usePracticeSession.ts`:
    - Implements timer logic entirely on the client using `Date.now()`, `setInterval`, and `sessionStorage`.
    - No corresponding backend timer API calls exist (`startTimer`, `syncTimer`, `stopTimer`).
  - `apps/web/src/components/practice/usePraticeMedia.ts` and
    `apps/web/src/components/practice/practiceStorage.ts`:
    - Implement all **media recording, persistence, and storage** concerns using `MediaRecorder`, `indexedDB`, `sessionStorage`, and `local` URLs.
    - This is effectively a business / data layer implemented under `components/practice` instead of a dedicated service module.
  - Backend has **no endpoints** for session‑timer synchronization; practice session creation is only via `POST /sessions`.
- **Impact**
  - Timer and media handling are **entirely front‑end only** and coupled to UI hooks, instead of partitioned between a backend timer source‑of‑truth and service layer as described in the architecture.

### 6. Profile and settings flow not implemented as per architecture

- **Design expectation**
  - `/profile` acts as a sub‑router for:
    - Sessions, challenges, friends, posts, profile settings, etc.
  - It should respect visibility settings, pull data via services, and expose profile/instrument configuration.
- **Current implementation**
  - In `apps/web/src/App.tsx`:
    - The `/profile` route is currently:
      - `element={<div style={{ padding: 24 }}>Profile / Settings (TBD)</div>}`
  - No frontend services or `KodaServerApi` methods exist yet for:
    - Profile visibility, instruments, challenge progress, or friend graphs.
- **Impact**
  - The Profile area is currently a stub and does not yet follow the specified sub‑router + service pattern.

### 7. Incomplete use of shared enums/union types for visibility and related concepts

- **Design expectation**
  - Use a **single shared enum/union type** for all “this | that” visibility‑related concepts:
    - Post visibility, profile visibility, challenge visibility, friend preview, instrument visibility, etc.
- **Current implementation**
  - `packages/shared/src/index.ts` defines:
    - `export type PostVisibility = "public" | "private" | "friends";`
  - Frontend `Post` component (`apps/web/src/components/practice/Post.tsx`) uses `PostVisibility` correctly for post visibility.
  - Other visibility concepts from the architecture (profile visibility, challenge visibility, friend preview) do not yet have shared types or usage in code.
- **Impact**
  - Current implementation only partially applies the “shared enum for visibility” guideline; additional visibility concepts are not yet modeled or enforced via shared types.

---

## Backend

### 8. API surface only partially implemented vs specification

- **Design expectation**
  - API surface includes endpoints for:
    - Auth & Users, Friends, Friend Requests, Practice Sessions, Media, Likes, Comments, Challenges, Notifications, Events, Search, Stats, etc.
- **Current implementation**
  - Routing is centralized in `apps/backend/src/app/[...slug]/route.ts`, which dispatches to:
    - `authHandlers` (`apps/backend/src/api/handlers/authHandlers.ts`)
    - `userHandlers` (`apps/backend/src/api/handlers/userHandlers.ts`)
    - `sessionHandlers` (`apps/backend/src/api/handlers/sessionHandlers.ts`)
  - Implemented areas:
    - `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/me`
    - `/users/:userId` (GET/PATCH/DELETE) and `/users/search`
    - `/sessions` (create), `/sessions/feed`, `/sessions/:sessionId` (GET/PATCH/DELETE)
  - Not yet implemented:
    - Friends (`/friends`), friend requests (`/friend-requests`),
    - Media (`/sessions/:sessionId/media`),
    - Likes, comments,
    - Challenges and completed‑challenges,
    - Notifications,
    - Events (`/events`, `/events/:month`, `/events/:eventId`),
    - Unified search (`/search`), stats (`/stats/user/:userId`).
- **Impact**
  - The backend currently exposes only a **subset** of the specified API; many features from the design document are not yet present.

### 9. PracticeSession ID field naming diverges from shared type & data model

- **Design expectation**
  - Data model and shared types should be consistent:
    - `practiceSession` table PK: `sessionID`.
    - Shared `PracticeSession` type and DAOs/services should follow the same primary key naming.
- **Current implementation**
  - Shared type in `packages/shared/src/index.ts`:
    - `export interface PracticeSession { sessionId: string; userId: string; ... }`
  - Backend `SessionService` (`apps/backend/src/api/services/sessionServices.ts`):
    - Creates sessions with:
      - `const id = crypto.randomUUID();`
      - Builds a `PracticeSession` with `id` and `createdAt`, not `sessionId`.
  - In‑memory DAO `SessionDao` (`apps/backend/src/db/dao/inMemoryDaos/inMemorySessionDao.ts`):
    - Stores sessions in `Map<string, PracticeSession>` keyed by `id`, even though the shared type defines `sessionId`.
  - Handlers like `getSession`, `updateSession`, `deleteSession` take a `sessionId` string but the stored object uses `id`.
- **Impact**
  - There is a **naming and structural mismatch** between:
    - Shared `PracticeSession` interface,
    - In‑memory DAO implementation,
    - Service and handler code,
    - And the architecture’s table schema (`sessionID`).
  - This breaks the “single source of truth” principle for the practice session identifier.

### 10. Missing backend services / DAOs for several domains

- **Design expectation**
  - Services:
    - Auth, User, PracticeSession, Event, Challenge.
  - DAOs:
    - Auth DAO, User DAO, Practice Session DAO, Event DAO, Challenge DAO, etc., exposed via factory functions.
- **Current implementation**
  - Implemented:
    - `AuthService` (`apps/backend/src/api/services/authServices.ts`)
    - `UserService` (`apps/backend/src/api/services/userServices.ts`)
    - `SessionService` (`apps/backend/src/api/services/sessionServices.ts`)
  - DAO interfaces + factories:
    - `AuthDAO`, `UserDAO`, `SessionDAO` with factories in `db/dao/factories/*`.
  - Missing:
    - `EventService`, `ChallengeService`, and related DAOs and factories.
    - DAOs for likes, comments, media, notifications, friends/friend‑requests tables.
- **Impact**
  - The layered structure (handler → service → DAO via factory) exists for a subset (auth, user, sessions) but is **not yet extended** to all domains outlined in the architecture.

### 11. Keyset pagination not yet backed by database query

- **Design expectation**
  - Feed should use **keyset pagination on `createdAt`** with efficient DB queries (JOIN, ORDER, LIMIT).
- **Current implementation**
  - In‑memory `SessionDao.getFeed`:
    - Filters sessions for the authenticated user.
    - Sorts them by `createdAt`.
    - Uses `lastItemId` and array slicing to return the “next page”.
  - There is currently **no Supabase/DB implementation** of `SessionDAO.getFeed` performing keyset pagination at the database level.
- **Impact**
  - Conceptually, the in‑memory DAO mimics keyset pagination, but the production‑grade behavior (database‑level keyset on `createdAt`) from the architecture is not yet implemented.

---

## Shared Types & Cross‑Cutting Concerns

### 12. Shared domain model is incomplete relative to the architecture

- **Design expectation**
  - Shared module should provide canonical types/enums for:
    - Users, practice sessions, friends, friend requests, challenges, events, notifications, media, likes, comments, and visibility enums.
- **Current implementation**
  - `packages/shared/src/index.ts` defines:
    - `AuthToken`, `User`, `PracticeSession`, `INSTRUMENTS`, `Instrument`, `PostVisibility`, `APP_CONFIG`.
  - Types for many entities listed in the data model (friends, friend requests, events, notifications, challenges, media, likes, comments) are not present yet.
- **Impact**
  - The shared type layer currently covers only a subset of the data model; additional entities will need to be added to match the architecture.

---

## Summary

At a high level:

- The **core layering pattern** (handlers → services → DAOs with factories, and frontend `KodaServerApi` + services with DI) is present but only partially applied.
- Many features described in `KODA-Architecture-and-Design.md` (friends, challenges, events, notifications, full feed behavior, backend timer, etc.) are **not yet implemented** or are implemented as local‑only/demo logic.
- There are notable **naming and modeling inconsistencies** around `PracticeSession` identifiers and incomplete adoption of shared enums/types for visibility and other cross‑cutting concerns.

