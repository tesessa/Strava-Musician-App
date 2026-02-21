import type { KodaServerApi } from "./KodaServerApi";
import type { User } from "@strava-musician-app/shared";

/**
 * Calls the actual Koda API. Uses Client Communicator for HTTP.
 * Stub: real HTTP calls to be wired when backend is ready.
 */
export class ServerFacade implements KodaServerApi {
  async getMe(): Promise<User | null> {
    // TODO: use Client Communicator to call GET /auth/me with stored token
    return null;
  }
}
