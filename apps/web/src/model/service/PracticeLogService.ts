import type { KodaServerApi } from "../network/KodaServerApi";
import type {
  CreateCommentRequest,
  CreatePracticeLogRequest,
  FeedRequest,
  PracticeLog,
  Visibility,
  UserSearchResult,
  MediaListResponse,
  LikesListResponse,
  CommentsListResponse,
  FriendsListResponse,
  UpdatePracticeLogRequest,
  FriendRequest,
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

  async getPracticeLog(practiceLogId: string): Promise<PracticeLog> {
    return this.server.getPracticeLog(practiceLogId);
  }
 
 
  async updatePracticeLog(
    practiceLogId: string,
    updates: UpdatePracticeLogRequest
  ): Promise<PracticeLog> {
    return this.server.updatePracticeLog(practiceLogId, updates);
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


    async searchUsers(query: string): Promise<UserSearchResult[]> {
        return this.server.searchUsers(query);
    }
    
  async sendFriendRequest(receiverId: string): Promise<FriendRequest> {
    return this.server.createFriendRequest(receiverId);
  }


  async commentOnPracticeLog(
    practiceLogId: string,
    text: string,
  ): Promise<void> {
    const request: CreateCommentRequest = { text };
    await this.server.createPracticeLogComment(practiceLogId, request);
  }

  async getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse> {
    return this.server.getPracticeLogMedia(practiceLogId);
  }

  async getPracticeLogLikes(practiceLogId: string): Promise<LikesListResponse> {
    return this.server.getPracticeLogLikes(practiceLogId);
  }

  async getPracticeLogComments(practiceLogId: string): Promise<CommentsListResponse> {
    return this.server.getPracticeLogComments(practiceLogId);
  }

  async getFriends(lastFriendId?: string, pageSize?: number): Promise<FriendsListResponse> {
    return this.server.getFriends({ lastFriendId, pageSize });
  }

  async deletePracticeLog(practiceLogId: string): Promise<void> {
    return this.server.deletePracticeLog(practiceLogId);
  }

    async deleteMedia(mediaId: string): Promise<void> {
    return this.server.deleteMedia(mediaId);
  }

  async getUserPracticeLogs(
    userId: string,
    lastItemId?: string,
    pageSize = 20
  ): Promise<PracticeLog[]> {
    return this.server.getUserPracticeLogs(userId, { lastItemId, pageSize });
  }
}
