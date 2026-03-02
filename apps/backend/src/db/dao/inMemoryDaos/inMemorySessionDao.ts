import type { PracticeSession } from "@strava-musician-app/shared";
import type { SessionDAO } from "../daos/sessionDao";
import { createAuthDAO } from "../factories/authDaoFactory";

const authDao = createAuthDAO();

export const sessions = new Map<string, PracticeSession>();

export const SessionDao: SessionDAO = {
  async createSession(session: PracticeSession) {
    const id = session.id;
    sessions.set(id, session);
    return session;
  },

  async getFeed(lastItemId: string | null, pageSize: number, token: string) {
    const user = await authDao.getUserByToken(token);
    if (!user) return [];

    // Get all sessions for this user, sorted chronologically by createdAt
    const userSessions = Array.from(sessions.values())
      .filter(session => session.userId === user.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // If lastItemId is null, return the first pageSize items
    if (!lastItemId) {
      return userSessions.slice(0, pageSize);
    }

    // Find the index of the lastItemId
    const idx = userSessions.findIndex(s => s.id === lastItemId);

    // If lastItemId not found or is the last item, return empty list
    if (idx === -1 || idx === userSessions.length - 1) {
      return [];
    }

    // Return the next pageSize items after lastItemId
    return userSessions.slice(idx + 1, idx + 1 + pageSize);
  },

  async getSession(sessionId) {
    return sessions.get(sessionId) ?? null;
  },

  async updateSession(sessionId, patch) {
    const existing = sessions.get(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    sessions.set(sessionId, updated);
    return updated;
  },

  async deleteSession(sessionId) {
    return sessions.delete(sessionId);
  }
};