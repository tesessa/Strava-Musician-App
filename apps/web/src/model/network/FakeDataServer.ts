import type { KodaServerApi } from "./KodaServerApi";
import type { User } from "@strava-musician-app/shared";

/** Fake user for demo mode. */
const FAKE_USER: User = {
  id: "demo-user-1",
  username: "demomusician",
  email: "demo@koda.example",
  displayName: "Demo Musician",
  createdAt: new Date("2024-01-15T12:00:00Z"),
};

/**
 * Returns fake data for demo/development. No network calls.
 */
export class FakeDataServer implements KodaServerApi {
  async getMe(): Promise<User | null> {
    return { ...FAKE_USER };
  }
}
