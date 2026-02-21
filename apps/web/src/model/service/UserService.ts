import type { KodaServerApi } from "../network/KodaServerApi";
import type { User } from "@strava-musician-app/shared";

/**
 * User/auth-related business logic. Receives KodaServerApi via dependency injection.
 * Components and hooks receive this service (or other services) rather than the server directly.
 */
export class UserService {
  constructor(private readonly server: KodaServerApi) {}

  /** Get the currently authenticated user (delegates to server). */
  async getCurrentUser(): Promise<User | null> {
    return this.server.getMe();
  }
}
