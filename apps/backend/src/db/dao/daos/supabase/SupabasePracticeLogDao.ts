import { PracticeLog } from "@strava-musician-app/shared";
import { PracticeLogDAO } from "../practiceLogDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseSessionDAO implements PracticeLogDAO {
  createPracticeLog(practiceLog: PracticeLog): Promise<PracticeLog> {
    throw new Error("Method not implemented.");
  }
  getFeed(
    lastItem: string | null,
    pageSize: number,
    token: string,
  ): Promise<PracticeLog[]> {
    throw new Error("Method not implemented.");
  }
  getPracticeLog(practiceLogId: string): Promise<PracticeLog | null> {
    throw new Error("Method not implemented.");
  }
  updatePracticeLog(
    practiceLogId: string,
    patch: Partial<PracticeLog>,
  ): Promise<PracticeLog | null> {
    throw new Error("Method not implemented.");
  }
  deletePracticeLog(practiceLogId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
