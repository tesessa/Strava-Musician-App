import type { PracticeSession } from "@strava-musician-app/shared";
import type { SessionDAO } from "../../db/dao/daos/sessionDao";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";

export class SessionService {
  constructor(private sessionDao: SessionDAO) {}

async createSession(
    data: Omit<PracticeSession, "id" | "createdAt" | "userId">,
    token: string
  ): Promise<PracticeSession> {
    // Extract user from token
    const user = await createAuthDAO().getUserByToken(token);
    if (!user) throw new Error("Unauthorized");

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const session: PracticeSession = {
      ...data,
      id,
      createdAt,
      userId: user.id, // Set userId from token
    };
    return this.sessionDao.createSession(session);
  }


  async getFeed({ lastItem, pageSize }: { lastItem: string | null; pageSize: number }, token: string): Promise<PracticeSession[]> {
    return this.sessionDao.getFeed(lastItem, pageSize, token);
  }

  async getSession(sessionId: string): Promise<PracticeSession | null> {
    return this.sessionDao.getSession(sessionId);
  }

  async updateSession(sessionId: string, patch: Partial<PracticeSession>): Promise<PracticeSession | null> {
    return this.sessionDao.updateSession(sessionId, patch);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessionDao.deleteSession(sessionId);
  }
}