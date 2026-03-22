import type { KodaServerApi } from "../network/KodaServerApi";
// import type { 
//     PracticeLog, 
//     FeedResponse, 
//     FeedRequest, 
//     UpdatePracticeLogRequest, 
//     CreateCommentRequest, 
//     CreatePracticeLogRequest, 
//     UserSearchResult, 
//     Comment, 
//     MediaListResponse, 
//     CreateMediaRequest, 
//     Media 
// } from "@strava-musician-app/shared";
import type {
  CreateCommentRequest,
  CreatePracticeLogRequest,
  FeedRequest,
  PracticeLog,
  Visibility,
  UserSearchResult,
  MediaListResponse
} from "@strava-musician-app/shared";

export class PracticeLogService {
  constructor(private readonly server: KodaServerApi) {}

    // async createPracticeLog(title: string, durationMinutes: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<PracticeLog> {
    //     return this.server.createPracticeLog({title, postText, privateText, instrument, durationMinutes, tempo, pieceTitle, composer});
    // }

    // practice Logs!!!
    // async createPracticeLog(request: CreatePracticeLogRequest): Promise<PracticeLog> {
    //     return this.server.createPracticeLog(request);
    // }

    // async getPracticeLogsFeed(request: FeedRequest): Promise<FeedResponse> {
    //     return this.server.getPracticeLogsFeed(request);
    // }

    // async getPracticeLog(practiceLogId: string): Promise<PracticeLog> {
    //     return this.server.getPracticeLog(practiceLogId);
    // }

    // async updatePracticeLog(practiceLogId: string, request: UpdatePracticeLogRequest): Promise<PracticeLog> {
    //     return this.server.updatePracticeLog(practiceLogId, request);
    // }

    // async deletePracticeLog(practiceLogId: string): Promise<void> {
    //     return this.server.deletePracticeLog(practiceLogId);
    // }

    // // Media
    // async createPracticeLogMedia(practiceLogId: string, request: CreateMediaRequest): Promise<Media> {
    //     return this.server.createPracticeLogMedia(practiceLogId, request);
    // }

    // async getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse> {
    //     return this.server.getPracticeLogMedia(practiceLogId);
    // }

    // async deleteMedia(mediaId: string): Promise<void> {
    //     return this.server.deleteMedia(mediaId);
    // }

    // // likes
    // async likePracticeLog(practiceLogId: string): Promise<void> {
    //     return this.server.likePracticeLog(practiceLogId);
    // }
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

    // async commentOnPracticeLog(practiceLogId: string, request: CreateCommentRequest): Promise<Comment> {
    //     return this.server.createPracticeLogComment(practiceLogId, request);
    // }

    // async sharePracticeLog(practiceLogId: string): Promise<void> {
    //     return this.server.sharePracticeLog(practiceLogId);
    // }

    // async getComments(practiceLogId: string) {
    //     return this.server.getPracticeLogComments(practiceLogId);
    // }

    // async getLikes(practiceLogId: string) {
    //     return this.server.getPracticeLogLikes(practiceLogId);
    // }

    async searchUsers(query: string): Promise<UserSearchResult[]> {
        return this.server.searchUsers(query);
    }
    
    async sendFriendRequest(receiverId: string): Promise<void> {
        return this.server.createFriendRequest(receiverId);
    }
 
    // async getFriends(lastItem?: string, pageSize?: number) {
    //     return this.server.getFriends({ lastItem, pageSize });
    // }
    
    // async removeFriend(friendId: string): Promise<void> {
    //     return this.server.deleteFriend(friendId);
    // }

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
}
