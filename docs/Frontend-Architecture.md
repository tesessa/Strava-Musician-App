# Koda Frontend Architecture

Use this document when building or refactoring frontend features. It defines layering, dependency injection, optimistic UI expectations, and the high-level UI structure.

## Frontend Pattern

All frontend components/pages should follow this pattern for getting data from the backend:

- **Components** — Handle display logic only
- **Services** — Keep business logic and data manipulation outside of main components
- **Server API layer** — See server API and dependency injection below
- **Client Communicator** — Handles HTTP requests (used by ServerFacade)

Frontend services should look nearly identical to backend services in terms of number/name of services and function definitions/types in parallel services.

## Server API and Dependency Injection

The frontend defines a single **KodaServerApi** interface implemented by:

- **ServerFacade** — Calls the actual API (uses Client Communicator for HTTP).
- **FakeDataServer** — Returns fake data for demo/development.

Which implementation is used is determined by an environment variable (e.g. demo mode => FakeDataServer). The chosen implementation is dependency-injected into singleton instances of each service. Services are, in turn, dependency-injected into the components or hooks that use them.

The frontend also defines a **KodaMediaApi** interface for object storage uploads, implemented by:

- **MediaService** — Uploads to Oracle Cloud Object Storage and returns full Oracle object URLs.
- **FakeMediaService** — Returns fake URLs and in-memory metadata for demo/development.

As with KodaServerApi, the selected media implementation is chosen by environment and injected once as a singleton into frontend code that handles media operations.

## Frontend Interaction Pattern (Optimistic UI + Loading States)

- **Creates (any object created from the frontend)**: Optimistically render the new item in the UI immediately (e.g. new practice log, comment, like, media attachment, event) assuming creation succeeds. If the backend call fails, rollback the optimistic change (remove the item, revert counts, show an error).
- **Updates (any object updated from the frontend)**: Optimistically apply the updated data in the UI (text, metadata, counts, etc.) while the request is in flight. If the update fails, rollback to the previous state and surface an error to the user.
- **Reads / fetching data**: Use a Suspense/skeleton-style pattern for loading. While data for a view (feed, profile sections, practice-log detail, notifications, etc.) is loading, show skeleton components or loading placeholders instead of empty states so users can see that data is in the process of loading.

## App Router and Frontend Structure

- **Home (Feed)** — Main feed of practice session posts. Includes Header, Tools, Notifications, Search Bar; Infinite Scroll loads more items (Post[]). Use date formatters to convert Unix epoch dates from the backend into different time zones/formats.
- **Calendar** — Scheduling and viewing events.
- **Profile** — Acts as a sub-router: all `/profile/`* routes render here, with URL-parsed tabs for Practice Session, Challenges (completed and in-progress), Friends, Posts, ProfileSettings. Build the profile to be reusable: use a prop from the URL for whose profile is viewed (default: logged-in user). Only show settings for the logged-in user; other data follows the profile owner privacy settings.

## Landing

Unauthenticated users see a simple landing page that describes the app, with "Sign in" and "Sign up" buttons.

## Related Docs

- Data model and storage: `docs/KODA-Data-Model-and-Storage.md`
- API contracts: `docs/KODA-API-Surface.md`
- End-to-end behavior: `docs/KODA-Key-Flows-and-UX.md`
