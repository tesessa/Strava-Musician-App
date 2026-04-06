import { LikesListResponse } from "@strava-musician-app/shared";
import { KodaServerApi } from "../network";

export class LikesService {
  constructor(private readonly server: KodaServerApi) {}

  /** POST /practice-logs/:practiceLogId/likes */
  async likePracticeLog(practiceLogId: string): Promise<void> {
    return this.server.likePracticeLog(practiceLogId);
  }

  /** DELETE /practice-logs/:practiceLogId/likes */
  async unlikePracticeLog(practiceLogId: string): Promise<void> {
    return this.server.unlikePracticeLog(practiceLogId);
  }

  /** GET /practice-logs/:practiceLogId/likes */
  async getPracticeLogLikes(practiceLogId: string): Promise<LikesListResponse> {
    return this.server.getPracticeLogLikes(practiceLogId);
  }

}