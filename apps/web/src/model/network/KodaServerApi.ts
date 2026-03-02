import type { User, PostVisibility } from "@strava-musician-app/shared";

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
  // might want to have this function return PracticeSession
  savePost(userId: string, title: string, visibility: PostVisibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string>;
  discardPost(sessionId: string): Promise<void>;
}

export type PostData = {
  title: string;
  notes: string;
  privateNote: string;
  visability: "public" | "private" | "friends";
  instrument: string;
  durationMinutes: number;
}