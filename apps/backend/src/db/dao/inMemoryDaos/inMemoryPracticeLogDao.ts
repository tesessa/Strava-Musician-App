import type { PracticeLog } from "@strava-musician-app/shared";
import type { PracticeLogDAO } from "../daos/practiceLogDao";
import { createAuthDAO } from "../factories/authDaoFactory";

const authDao = createAuthDAO();

export const practiceLogs = new Map<string, PracticeLog>();

export const PracticeLogDao: PracticeLogDAO = {
  async getUserPracticeLogs(userId: string, lastItemId: string | null, pageSize: number) {
    // Get all practice logs for the user, sorted chronologically by createdAt
    const userPracticeLogs = Array.from(practiceLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!lastItemId) {
      return userPracticeLogs.slice(0, pageSize);
    }
    const idx = userPracticeLogs.findIndex((l) => l.practiceLogId === lastItemId);
    if (idx === -1 || idx === userPracticeLogs.length - 1) {
      return [];
    }
    return userPracticeLogs.slice(idx + 1, idx + 1 + pageSize);
  },

  async createPracticeLog(practiceLog: PracticeLog) {
    const id = practiceLog.practiceLogId;
    practiceLogs.set(id, practiceLog);
    return practiceLog;
  },

  async getFeed(lastItemId: string | null, pageSize: number, token: string) {
    const user = await authDao.getUserByToken(token);
    if (!user) return [];

    // Get friend userIds (assuming inMemorySocialState is imported and available)
    const { inMemorySocialState } = await import("./inMemorySocialState");
    const friendIds = inMemorySocialState.friendships
      .filter(f => f.userId === user.userId)
      .map(f => f.friendId);

    // Collect logs from user and friends
    const feedLogs = Array.from(practiceLogs.values())
      .filter((log) => log.userId === user.userId || friendIds.includes(log.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!lastItemId) {
      return feedLogs.slice(0, pageSize);
    }
    const idx = feedLogs.findIndex((l) => l.practiceLogId === lastItemId);
    if (idx === -1 || idx === feedLogs.length - 1) {
      return [];
    }
    return feedLogs.slice(idx + 1, idx + 1 + pageSize);
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
