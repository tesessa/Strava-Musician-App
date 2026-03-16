# Koda Backend Architecture

Use this document when implementing backend endpoints, service logic, or DAO implementations.

## Backend Pattern

All backend routes should follow this pattern for handling requests:

- **Handlers** — One handler per endpoint
- **Services** — Auth Service, User Service, Practice Log Service, Event Service, Challenge Service
- **DAOs** — Auth DAO, User DAO, Practice Log DAO, Event DAO, Challenge DAO

DAOs should be defined by interfaces; concrete implementations should be created using the factory pattern.

## Service and DAO Expectations

- Keep one handler per endpoint to avoid mixed route concerns.
- Handlers call services, and services are responsible for business logic.
- DAOs stay behind interfaces so implementations can be swapped with factories.

## High-Level Request Flow

1. API request enters the route handler.
2. Handler validates input/auth context and calls a service method.
3. Service executes business rules and delegates persistence to DAO interfaces.
4. DAO factory-provided implementation reads/writes data storage.
5. Service returns structured data to the handler.
6. Handler serializes and returns the HTTP response.

## Related Docs

- API endpoint contracts: `docs/KODA-API-Surface.md`
- Data entities and storage: `docs/KODA-Data-Model-and-Storage.md`
- User and system behaviors: `docs/KODA-Key-Flows-and-UX.md`
