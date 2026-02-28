import type { User } from "@strava-musician-app/shared";

/**
 * Single API surface for the Koda frontend. Implemented by ServerFacade (real API)
 * and FakeDataServer (demo/fake data). The implementation is chosen by environment
 * and dependency-injected into singleton services.
 */
export interface KodaServerApi {
  /** Return the authenticated user's profile if token is valid (GET /auth/me). */
  getMe(): Promise<User | null>;
  login(email: string, password: string): Promise<User | null>;
  register(username: string, email: string, password: string): Promise<User>;
  savePost(post: string): Promise<void>;
  discardPost(postId: string): Promise<void>;
}

export type PostData = {
  title: string;
  notes: string;
  privateNote: string;
  visability: "public" | "private" | "friends";
  instrument: string;
  durationMinutes: number;
}