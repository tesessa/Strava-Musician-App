import type { KodaServerApi } from "./KodaServerApi";
import { FakeDataHelper } from "./FakeDataHelper";
import type {
  AuthResponse,
  Challenge,
  Comment,
  CommentsListResponse,
  CompletedChallengesResponse,
  CreateChallengeRequest,
  CreateCommentRequest,
  CreateEventRequest,
  CreateMediaRequest,
  CreatePracticeLogRequest,
  Event,
  FeedRequest,
  FeedResponse,
  FriendRequestsPageRequest,
  FriendsListRequest,
  FriendsListResponse,
  IncomingFriendRequestsResponse,
  LikesListResponse,
  LoginRequest,
  Media,
  MediaListResponse,
  NotificationsListResponse,
  OutgoingFriendRequestsResponse,
  PracticeLog,
  RegisterRequest,
  UpdateEventRequest,
  UpdatePracticeLogRequest,
  User,
  UserPracticeLogsRequest,
  UserPracticeLogsResponse,
  UserSearchResult,
  UserUpdateRequest,
} from "@strava-musician-app/shared";

/**
 * Returns fake data for demo/development. No network calls.
 */
export class FakeDataServer implements KodaServerApi {
  private readonly helper = new FakeDataHelper();

  async register(request: RegisterRequest): Promise<AuthResponse> {
    return this.helper.register(request);
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    return this.helper.login(request);
  }

  async logout(): Promise<void> {
    this.helper.logout();
  }

  async getMe(): Promise<User> {
    return this.helper.getMe();
  }

  async getUser(userId: string): Promise<User> {
    return this.helper.getUser(userId);
  }

  async updateUser(userId: string, request: UserUpdateRequest): Promise<User> {
    return this.helper.updateUser(userId, request);
  }

  async getUserPracticeLogs(
    userId: string,
    request: UserPracticeLogsRequest,
  ): Promise<UserPracticeLogsResponse> {
    return this.helper.getUserPracticeLogs(userId, request);
  }

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    return this.helper.searchUsers(query);
  }

  async upsertFriend(friendId: string): Promise<void> {
    this.helper.upsertFriend(friendId);
  }

  async deleteFriend(friendId: string): Promise<void> {
    this.helper.deleteFriend(friendId);
  }

  async getFriends(request: FriendsListRequest): Promise<FriendsListResponse> {
    return this.helper.getFriends(request);
  }

  async createFriendRequest(receiverId: string): Promise<void> {
    this.helper.createFriendRequest(receiverId);
  }

  async getIncomingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<IncomingFriendRequestsResponse> {
    return this.helper.getIncomingFriendRequests(request);
  }

  async getOutgoingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<OutgoingFriendRequestsResponse> {
    return this.helper.getOutgoingFriendRequests(request);
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    this.helper.acceptFriendRequest(requestId);
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    this.helper.rejectFriendRequest(requestId);
  }

  async cancelFriendRequest(requestId: string): Promise<void> {
    this.helper.cancelFriendRequest(requestId);
  }

  async createPracticeLog(request: CreatePracticeLogRequest): Promise<PracticeLog> {
    return this.helper.createPracticeLog(request);
  }

  async getPracticeLogsFeed(request: FeedRequest): Promise<FeedResponse> {
    return this.helper.getPracticeLogsFeed(request);
  }

  async getPracticeLog(practiceLogId: string): Promise<PracticeLog> {
    return this.helper.getPracticeLog(practiceLogId);
  }

  async updatePracticeLog(
    practiceLogId: string,
    request: UpdatePracticeLogRequest,
  ): Promise<PracticeLog> {
    return this.helper.updatePracticeLog(practiceLogId, request);
  }

  async deletePracticeLog(practiceLogId: string): Promise<void> {
    this.helper.deletePracticeLog(practiceLogId);
  }

  async createPracticeLogMedia(
    practiceLogId: string,
    request: CreateMediaRequest,
  ): Promise<Media> {
    return this.helper.createPracticeLogMedia(practiceLogId, request);
  }

  async getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse> {
    return this.helper.getPracticeLogMedia(practiceLogId);
  }

  async deleteMedia(mediaId: string): Promise<void> {
    this.helper.deleteMedia(mediaId);
  }

  async likePracticeLog(practiceLogId: string): Promise<void> {
    this.helper.likePracticeLog(practiceLogId);
  }

  async unlikePracticeLog(practiceLogId: string): Promise<void> {
    this.helper.unlikePracticeLog(practiceLogId);
  }

  async getPracticeLogLikes(practiceLogId: string): Promise<LikesListResponse> {
    return this.helper.getPracticeLogLikes(practiceLogId);
  }

  async createPracticeLogComment(
    practiceLogId: string,
    request: CreateCommentRequest,
  ): Promise<Comment> {
    return this.helper.createPracticeLogComment(practiceLogId, request);
  }

  async getPracticeLogComments(practiceLogId: string): Promise<CommentsListResponse> {
    return this.helper.getPracticeLogComments(practiceLogId);
  }

  async deleteComment(commentId: string): Promise<void> {
    this.helper.deleteComment(commentId);
  }

  async getChallenges(): Promise<Challenge[]> {
    return this.helper.getChallenges();
  }

  async createChallenge(request: CreateChallengeRequest): Promise<Challenge> {
    return this.helper.createChallenge(request);
  }

  async getChallenge(challengeId: string): Promise<Challenge> {
    return this.helper.getChallenge(challengeId);
  }

  async completeChallenge(challengeId: string): Promise<void> {
    this.helper.completeChallenge(challengeId);
  }

  async getCompletedChallenges(userId: string): Promise<CompletedChallengesResponse> {
    return this.helper.getCompletedChallenges(userId);
  }

  async getNotifications(): Promise<NotificationsListResponse> {
    return this.helper.getNotifications();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    this.helper.markNotificationRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.helper.deleteNotification(notificationId);
  }

  async createEvent(request: CreateEventRequest): Promise<Event> {
    return this.helper.createEvent(request);
  }

  async getEventsForMonth(month: string): Promise<Event[]> {
    return this.helper.getEventsForMonth(month);
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.helper.getEvent(eventId);
  }

  async updateEvent(eventId: string, request: UpdateEventRequest): Promise<Event> {
    return this.helper.updateEvent(eventId, request);
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.helper.deleteEvent(eventId);
  }

  async sharePracticeLog(practiceLogId: string): Promise<void> {
    // Legacy endpoint placeholder retained for backward compatibility.
    console.log("[FakeDataServer] Share practice log:", practiceLogId);
  }
}
