import type { User } from "@strava-musician-app/shared";

/**
 * Single API surface for the Koda frontend. Implemented by ServerFacade (real API)
 * and FakeDataServer (demo/fake data). The implementation is chosen by environment
 * and dependency-injected into singleton services.
 */
export interface KodaServerApi {
  /** Return the authenticated user's profile if token is valid (GET /auth/me). */
  getMe(): Promise<User | null>;
}
