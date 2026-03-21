import type { KodaServerApi } from "../network/KodaServerApi";
import type {
  CreateCommentRequest,
  CreatePracticeLogRequest,
  FeedRequest,
  PracticeLog,
  Visibility,
} from "@strava-musician-app/shared";

export class PracticeLogService {
  constructor(private readonly server: KodaServerApi) {}

  async savePracticeLog(
    userId: string,
    title: string,
    visibility: Visibility,
    duration: number,
    postText?: string,
    privateText?: string,
    instrument?: string,
    tempo?: number,
    pieceTitle?: string,
    composer?: string,
  ): Promise<string> {
    // Server derives user/visibility from the authenticated user.
    // We keep these params to avoid changing existing UI signatures.
    void userId;
    void visibility;
    const request: CreatePracticeLogRequest = {
      title,
      postText,
      privateText,
      instrument,
      durationMinutes: duration,
      tempo,
      pieceTitle,
      composer,
    };

    const created = await this.server.createPracticeLog(request);
    return created.practiceLogId;
  }

  async discardPracticeLog(practiceLogId: string): Promise<void> {
    return this.server.deletePracticeLog(practiceLogId);
  }

  // Home-feed methods
  async getFeed(): Promise<PracticeLog[]> {
    const request: FeedRequest = { pageSize: 15 };
    return this.server.getPracticeLogsFeed(request);
  }

  async likePracticeLog(practiceLogId: string): Promise<void> {
    return this.server.likePracticeLog(practiceLogId);
  }

  async unlikePracticeLog(practiceLogId: string): Promise<void> {
    return this.server.unlikePracticeLog(practiceLogId);
  }

  async commentOnPracticeLog(
    practiceLogId: string,
    text: string,
  ): Promise<void> {
    const request: CreateCommentRequest = { text };
    await this.server.createPracticeLogComment(practiceLogId, request);
  }
}
