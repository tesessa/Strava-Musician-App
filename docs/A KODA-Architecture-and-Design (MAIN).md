# Koda Architecture and Design

This file is the entry point for Koda architecture documentation. Detailed guidance has been split into focused topic docs so requirements are easier to find and maintain.

## Documentation Map

- [Koda Frontend Architecture](./KODA-Frontend-Architecture.md)  
  Frontend layering, dependency injection, media API integration, optimistic create/update behavior, and Suspense/skeleton loading expectations.

- [Koda Backend Architecture](./KODA-Backend-Architecture.md)  
  Backend handler/service/DAO patterns, factory usage for DAO implementations, and high-level request flow.

- [Koda Data Model and Storage](./KODA-Data-Model-and-Storage.md)  
  Core data conventions, table-level schema definitions, visibility rules, challenge data semantics, and media storage behavior.

- [Koda API Surface](./KODA-API-Surface.md)  
  Endpoint contract tables grouped by domain (Auth, Users, Friends, Practice Logs, Media, Events, etc.).

- [Koda Key Flows and UX](./KODA-Key-Flows-and-UX.md)  
  User/system flows, frontend-backend interaction expectations, and reliability/performance/compatibility/cost guidance.

## How to Use These Docs

1. Start here to choose the right topic doc.
2. Use frontend/backend docs for implementation conventions.
3. Use API/data docs for contracts and schema details.
4. Use key flows doc for end-to-end behavior and UX expectations.
