import type { PracticeSession } from "@strava-musician-app/shared";
import type { SessionDAO } from "../../db/dao/daos/sessionDao";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";

export class SessionService {
  constructor(private sessionDao: SessionDAO) {}

  async createSession(
    data: Omit<PracticeSession, "sessionId" | "createdAt" | "userId">,
    token: string
  ): Promise<PracticeSession> {
    const user = await createAuthDAO().getUserByToken(token);
    if (!user) throw new Error("Unauthorized");

    const sessionId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const session: PracticeSession = {
      ...data,
      sessionId,
      createdAt,
      userId: user.userId,
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