import type { User, Visibility, PracticeLog } from "@strava-musician-app/shared";

/**
 * Single API surface for the Koda frontend. Implemented by ServerFacade (real API)
 * and FakeDataServer (demo/fake data). The implementation is chosen by environment
 * and dependency-injected into singleton services.
 */
export interface KodaServerApi {
  /** Return the authenticated user's profile if token is valid (GET /auth/me). */
  getMe(): Promise<User | null>;
  login(email: string, password: string): Promise<User | null>;
  register(username: string, email: string, password: string): Promise<User | null>;
  savePracticeLog(userId: string, title: string, visibility: Visibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string>;
  discardPracticeLog(practiceLogId: string): Promise<void>;
  // home-feed methods
  getFeed(): Promise<PracticeLog[]>;
  likePracticeLog(practiceLogId: string): Promise<void>;
  unlikePracticeLog(practiceLogId: string): Promise<void>;
  commentOnPracticeLog(practiceLogId: string, text: string): Promise<void>;
  sharePracticeLog(practiceLogId: string): Promise<void>;
}

export type PracticeLogData = {
  title: string;
  notes: string;
  privateNote: string;
  visability: "public" | "private" | "friends";
  instrument: string;
  durationMinutes: number;
};
