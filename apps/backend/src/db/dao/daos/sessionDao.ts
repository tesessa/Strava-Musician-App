import type { PracticeSession } from "@strava-musician-app/shared";

export interface SessionDAO {
  createSession(session: PracticeSession): Promise<PracticeSession>;
  getFeed(lastItem: string | null, pageSize: number, token: string): Promise<PracticeSession[]>;
  getSession(sessionId: string): Promise<PracticeSession | null>;
  updateSession(sessionId: string, patch: Partial<PracticeSession>): Promise<PracticeSession | null>;
  deleteSession(sessionId: string): Promise<boolean>;
}