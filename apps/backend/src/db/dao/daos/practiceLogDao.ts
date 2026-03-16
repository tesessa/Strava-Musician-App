import type { PracticeLog } from "@strava-musician-app/shared";

export interface PracticeLogDAO {
  createPracticeLog(practiceLog: PracticeLog): Promise<PracticeLog>;
  getFeed(lastItem: string | null, pageSize: number, token: string): Promise<PracticeLog[]>;
  getPracticeLog(practiceLogId: string): Promise<PracticeLog | null>;
  updatePracticeLog(practiceLogId: string, patch: Partial<PracticeLog>): Promise<PracticeLog | null>;
  deletePracticeLog(practiceLogId: string): Promise<boolean>;
}
