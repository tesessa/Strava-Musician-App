import type { PracticeLog } from "@strava-musician-app/shared";
import type { PracticeLogDAO } from "../daos/practiceLogDao";
import { createAuthDAO } from "../factories/authDaoFactory";

const authDao = createAuthDAO();

export const practiceLogs = new Map<string, PracticeLog>();

export const PracticeLogDao: PracticeLogDAO = {
  async createPracticeLog(practiceLog: PracticeLog) {
    const id = practiceLog.practiceLogId;
    practiceLogs.set(id, practiceLog);
    return practiceLog;
  },

  async getFeed(lastItemId: string | null, pageSize: number, token: string) {
    const user = await authDao.getUserByToken(token);
    if (!user) return [];

    // Get all practice logs for this user, sorted chronologically by createdAt
    const userPracticeLogs = Array.from(practiceLogs.values())
      .filter((log) => log.userId === user.userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // If lastItemId is null, return the first pageSize items
    if (!lastItemId) {
      return userPracticeLogs.slice(0, pageSize);
    }

    // Find the index of the lastItemId
    const idx = userPracticeLogs.findIndex((l) => l.practiceLogId === lastItemId);

    // If lastItemId not found or is the last item, return empty list
    if (idx === -1 || idx === userPracticeLogs.length - 1) {
      return [];
    }

    // Return the next pageSize items after lastItemId
    return userPracticeLogs.slice(idx + 1, idx + 1 + pageSize);
  },

  async getPracticeLog(practiceLogId) {
    return practiceLogs.get(practiceLogId) ?? null;
  },

  async updatePracticeLog(practiceLogId, patch) {
    const existing = practiceLogs.get(practiceLogId);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    practiceLogs.set(practiceLogId, updated);
    return updated;
  },

  async deletePracticeLog(practiceLogId) {
    return practiceLogs.delete(practiceLogId);
  },
};
