import { ClientCommunicator } from "./ClientCommunicator";
import type { KodaServerApi } from "./KodaServerApi";
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
 * Calls the actual Koda API through ClientCommunicator.
 * This class is intentionally transport-focused: endpoint routing, auth headers, and typing.
 */
export class ServerFacade implements KodaServerApi {
  private readonly SERVER_URL =
    import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";
  private readonly communicator = new ClientCommunicator(this.SERVER_URL);
  private authToken: string | null = null;

  public constructor() {
    this.loadAuthToken();
  }

  private buildAuthHeaders(): Headers {
    const headers = new Headers();
    if (this.authToken) {
      headers.append("Authorization", `Bearer ${this.authToken}`);
    }
    return headers;
  }

  private setAuthToken(token: string): void {
    this.authToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  private loadAuthToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      this.authToken = token;
    }
  }

  private clearAuthToken(): void {
    this.authToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  private isUnauthorizedError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const message = error.message.toLowerCase();
    return message.includes("401") || message.includes("unauthorized");
  }

  private async withAuthRecovery<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        this.clearAuthToken();
      }
      throw error;
    }
  }

  private buildQuery(
    params: Record<string, string | number | undefined>,
  ): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    }
    const queryString = query.toString();
    return queryString.length > 0 ? `?${queryString}` : "";
  }

  private async get<RES>(endpoint: string, useAuth = true): Promise<RES> {
    const request = async () =>
      this.communicator.get<RES>(
        endpoint,
        useAuth ? this.buildAuthHeaders() : undefined,
      );
    return useAuth ? this.withAuthRecovery(request) : request();
  }

  private async post<REQ, RES>(
    endpoint: string,
    requestBody?: REQ,
    useAuth = true,
  ): Promise<RES> {
    const request = async () =>
      this.communicator.post<REQ, RES>(
        requestBody,
        endpoint,
        useAuth ? this.buildAuthHeaders() : undefined,
      );
    return useAuth ? this.withAuthRecovery(request) : request();
  }

  private async patch<REQ, RES>(
    endpoint: string,
    requestBody: REQ,
    useAuth = true,
  ): Promise<RES> {
    const request = async () =>
      this.communicator.patch<REQ, RES>(
        requestBody,
        endpoint,
        useAuth ? this.buildAuthHeaders() : undefined,
      );
    return useAuth ? this.withAuthRecovery(request) : request();
  }

  private async delete<RES>(endpoint: string, useAuth = true): Promise<RES> {
    const request = async () =>
      this.communicator.delete<RES>(
        endpoint,
        useAuth ? this.buildAuthHeaders() : undefined,
      );
    return useAuth ? this.withAuthRecovery(request) : request();
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<RegisterRequest, AuthResponse>(
      "/auth/register",
      request,
      false,
    );
    this.setAuthToken(response.token);
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<LoginRequest, AuthResponse>(
      "/auth/login",
      request,
      false,
    );
    this.setAuthToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post<undefined, void>("/auth/logout", undefined, true);
    } finally {
      this.clearAuthToken();
    }
  }

  async getMe(): Promise<User> {
    const response = await this.get<User | { user: User }>("/auth/me", true);
    return "user" in response ? response.user : response;
  }

  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, request: UserUpdateRequest): Promise<User> {
    return this.patch<UserUpdateRequest, User>(`/users/${userId}`, request);
  }

  async getUserPracticeLogs(
    userId: string,
    request: UserPracticeLogsRequest,
  ): Promise<UserPracticeLogsResponse> {
    const query = this.buildQuery({
      lastItem: request.lastItem,
      pageSize: request.pageSize,
    });
    return this.get<UserPracticeLogsResponse>(`/users/${userId}/practice-logs${query}`);
  }

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const queryString = this.buildQuery({ query });
    return this.get<UserSearchResult[]>(`/users/search${queryString}`);
  }

  async upsertFriend(friendId: string): Promise<void> {
    return this.post<undefined, void>(`/friends/${friendId}`, undefined);
  }

  async deleteFriend(friendId: string): Promise<void> {
    return this.delete<void>(`/friends/${friendId}`);
  }

  async getFriends(request: FriendsListRequest): Promise<FriendsListResponse> {
    const query = this.buildQuery({
      lastItem: request.lastItem,
      pageSize: request.pageSize,
    });
    return this.get<FriendsListResponse>(`/friends${query}`);
  }

  async createFriendRequest(receiverId: string): Promise<void> {
    return this.post<undefined, void>(
      `/friend-requests/${receiverId}`,
      undefined,
    );
  }

  async getIncomingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<IncomingFriendRequestsResponse> {
    const query = this.buildQuery({
      lastItem: request.lastItem,
      pageSize: request.pageSize,
    });
    return this.get<IncomingFriendRequestsResponse>(
      `/friend-requests/incoming${query}`,
    );
  }

  async getOutgoingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<OutgoingFriendRequestsResponse> {
    const query = this.buildQuery({
      lastItem: request.lastItem,
      pageSize: request.pageSize,
    });
    return this.get<OutgoingFriendRequestsResponse>(
      `/friend-requests/outgoing${query}`,
    );
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    return this.post<undefined, void>(
      `/friend-requests/${requestId}/accept`,
      undefined,
    );
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    return this.post<undefined, void>(
      `/friend-requests/${requestId}/reject`,
      undefined,
    );
  }

  async cancelFriendRequest(requestId: string): Promise<void> {
    return this.delete<void>(`/friend-requests/${requestId}`);
  }

  async createPracticeLog(
    request: CreatePracticeLogRequest,
  ): Promise<PracticeLog> {
    return this.post<CreatePracticeLogRequest, PracticeLog>(
      "/practice-logs",
      request,
    );
  }

  async getPracticeLogsFeed(request: FeedRequest): Promise<FeedResponse> {
    const query = this.buildQuery({
      lastItem: request.lastItem,
      pageSize: request.pageSize,
    });
    return this.get<FeedResponse>(`/practice-logs/feed${query}`);
  }

  async getPracticeLog(practiceLogId: string): Promise<PracticeLog> {
    return this.get<PracticeLog>(`/practice-logs/${practiceLogId}`);
  }

  async updatePracticeLog(
    practiceLogId: string,
    request: UpdatePracticeLogRequest,
  ): Promise<PracticeLog> {
    return this.patch<UpdatePracticeLogRequest, PracticeLog>(
      `/practice-logs/${practiceLogId}`,
      request,
    );
  }

  async deletePracticeLog(practiceLogId: string): Promise<void> {
    return this.delete<void>(`/practice-logs/${practiceLogId}`);
  }

  async createPracticeLogMedia(
    practiceLogId: string,
    request: CreateMediaRequest,
  ): Promise<Media> {
    return this.post<CreateMediaRequest, Media>(
      `/practice-logs/${practiceLogId}/media`,
      request,
    );
  }

  async getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse> {
    return this.get<MediaListResponse>(`/practice-logs/${practiceLogId}/media`);
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.delete<void>(`/media/${mediaId}`);
  }

  async likePracticeLog(practiceLogId: string): Promise<void> {
    return this.post<undefined, void>(
      `/practice-logs/${practiceLogId}/likes`,
      undefined,
    );
  }

  async unlikePracticeLog(practiceLogId: string): Promise<void> {
    return this.delete<void>(`/practice-logs/${practiceLogId}/likes`);
  }

  async getPracticeLogLikes(practiceLogId: string): Promise<LikesListResponse> {
    return this.get<LikesListResponse>(`/practice-logs/${practiceLogId}/likes`);
  }

  async createPracticeLogComment(
    practiceLogId: string,
    request: CreateCommentRequest,
  ): Promise<Comment> {
    return this.post<CreateCommentRequest, Comment>(
      `/practice-logs/${practiceLogId}/comments`,
      request,
    );
  }

  async getPracticeLogComments(
    practiceLogId: string,
  ): Promise<CommentsListResponse> {
    return this.get<CommentsListResponse>(`/practice-logs/${practiceLogId}/comments`);
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.delete<void>(`/comments/${commentId}`);
  }

  async getChallenges(): Promise<Challenge[]> {
    return this.get<Challenge[]>("/challenges");
  }

  async createChallenge(request: CreateChallengeRequest): Promise<Challenge> {
    return this.post<CreateChallengeRequest, Challenge>("/challenges", request);
  }

  async getChallenge(challengeId: string): Promise<Challenge> {
    return this.get<Challenge>(`/challenges/${challengeId}`);
  }

  async completeChallenge(challengeId: string): Promise<void> {
    return this.post<undefined, void>(
      `/challenges/${challengeId}/complete`,
      undefined,
    );
  }

  async getCompletedChallenges(
    userId: string,
  ): Promise<CompletedChallengesResponse> {
    return this.get<CompletedChallengesResponse>(
      `/users/${userId}/completed-challenges`,
    );
  }

  async getNotifications(): Promise<NotificationsListResponse> {
    return this.get<NotificationsListResponse>("/notifications");
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.patch<undefined, void>(
      `/notifications/${notificationId}/read`,
      undefined,
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.delete<void>(`/notifications/${notificationId}`);
  }

  async createEvent(request: CreateEventRequest): Promise<Event> {
    return this.post<CreateEventRequest, Event>("/events", request);
  }

  async getEventsForMonth(month: string): Promise<Event[]> {
    return this.get<Event[]>(`/events/${month}`);
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.get<Event>(`/events/${eventId}`);
  }

  async updateEvent(eventId: string, request: UpdateEventRequest): Promise<Event> {
    return this.patch<UpdateEventRequest, Event>(`/events/${eventId}`, request);
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.delete<void>(`/events/${eventId}`);
  }
}
