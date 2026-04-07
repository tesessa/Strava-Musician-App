import type { PracticeLog } from "@strava-musician-app/shared";
import type { PracticeLogDAO } from "../../db/dao/daos/practiceLogDao";
import { createAuthDAO } from "../../db/dao/factories/authDaoFactory";

export class PracticeLogService {
  constructor(private practiceLogDao: PracticeLogDAO) {}

  async getUserPracticeLogs(
    { userId, lastItem, pageSize }: { userId: string; lastItem: string | null; pageSize: number }
  ): Promise<PracticeLog[]> {
    return this.practiceLogDao.getUserPracticeLogs(userId, lastItem, pageSize);
  }

  async createPracticeLog(
    data: Omit<PracticeLog, "practiceLogId" | "createdAt" | "userId">,
    token: string
  ): Promise<PracticeLog> {
    const user = await createAuthDAO().getUserByToken(token);
    if (!user) throw new Error("Unauthorized");

    const practiceLogId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const practiceLog: PracticeLog = {
      ...data,
      practiceLogId,
      createdAt,
      userId: user.userId,
    };
    return this.practiceLogDao.createPracticeLog(practiceLog);
  }

  async getFeed(
    { lastItem, pageSize }: { lastItem: string | null; pageSize: number },
    token: string
  ): Promise<PracticeLog[]> {
    return this.practiceLogDao.getFeed(lastItem, pageSize, token);
  }

  async getPracticeLog(practiceLogId: string): Promise<PracticeLog | null> {
    
    return this.practiceLogDao.getPracticeLog(practiceLogId);
  }

  async updatePracticeLog(
    practiceLogId: string,
    patch: Partial<PracticeLog>
  ): Promise<PracticeLog | null> {
    return this.practiceLogDao.updatePracticeLog(practiceLogId, patch);
  }

  async deletePracticeLog(practiceLogId: string): Promise<boolean> {
    return this.practiceLogDao.deletePracticeLog(practiceLogId);
  }
}
