# @strava-musician-app/shared

Shared types, constants, and utilities used by both the frontend (`apps/web`) and backend (`apps/backend`).

## Usage

Import from `@strava-musician-app/shared` in either app:

```typescript
import { User, PracticeSession, APP_CONFIG } from "@strava-musician-app/shared";
```

## Building

The shared package must be built before running the apps:

```bash
npm run build -w packages/shared
```

This happens automatically when running `npm start` from the root (via `prestart`).

## Future improvements

Note: I may add watch-mode tooling (e.g. tsup or unbuild) so this package rebuilds automatically when changed during development.
