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
 * Single API surface for the Koda frontend. Implemented by ServerFacade (real API)
 * and FakeDataServer (demo/fake data). The implementation is chosen by environment
 * and dependency-injected into singleton services.
 */
export interface KodaServerApi {
  // ===================
  // Users and Auth
  // ===================

  /** POST /auth/register */
  register(request: RegisterRequest): Promise<AuthResponse>;

  /** POST /auth/login */
  login(request: LoginRequest): Promise<AuthResponse>;

  /** POST /auth/logout */
  logout(): Promise<void>;

  /** GET /auth/me */
  getMe(): Promise<User>;

  /** GET /users/:userId */
  getUser(userId: string): Promise<User>;

  /** PATCH /users/:userId */
  updateUser(userId: string, request: UserUpdateRequest): Promise<User>;

  /** GET /users/:userId/practice-logs (keyset pagination) */
  getUserPracticeLogs(
    userId: string,
    request: UserPracticeLogsRequest,
  ): Promise<UserPracticeLogsResponse>;

  /** GET /users/search?query=... */
  searchUsers(query: string): Promise<UserSearchResult[]>;

  // ===================
  // Friends
  // ===================

  /** DELETE /friends/:friendId */
  deleteFriend(friendId: string): Promise<void>;

  /** GET /friends (keyset pagination) */
  getFriends(request: FriendsListRequest): Promise<FriendsListResponse>;

  // ===================
  // Friend Requests
  // ===================

  /** POST /friend-requests/:receiverId */
  createFriendRequest(receiverId: string): Promise<void>;

  /** GET /friend-requests/incoming (keyset pagination) */
  getIncomingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<IncomingFriendRequestsResponse>;

  /** GET /friend-requests/outgoing (keyset pagination) */
  getOutgoingFriendRequests(
    request: FriendRequestsPageRequest,
  ): Promise<OutgoingFriendRequestsResponse>;

  /** POST /friend-requests/:requestId/accept */
  acceptFriendRequest(requestId: string): Promise<void>;

  /** POST /friend-requests/:requestId/reject */
  rejectFriendRequest(requestId: string): Promise<void>;

  /** DELETE /friend-requests/:requestId */
  cancelFriendRequest(requestId: string): Promise<void>;

  // ===================
  // Practice Logs
  // ===================

  /** POST /practice-logs */
  createPracticeLog(request: CreatePracticeLogRequest): Promise<PracticeLog>;
  // used to be: savePracticeLog(userId, title, visibility, duration, ...): Promise<string>

  /** GET /practice-logs/feed (keyset pagination) */
  getPracticeLogsFeed(request: FeedRequest): Promise<FeedResponse>;
  // used to be: getFeed(): Promise<PracticeLog[]>

  /** GET /practice-logs/:practiceLogId */
  getPracticeLog(practiceLogId: string): Promise<PracticeLog>;

  /** PATCH /practice-logs/:practiceLogId */
  updatePracticeLog(
    practiceLogId: string,
    request: UpdatePracticeLogRequest,
  ): Promise<PracticeLog>;

  /** DELETE /practice-logs/:practiceLogId */
  deletePracticeLog(practiceLogId: string): Promise<void>;
  // used to be: discardPracticeLog(practiceLogId): Promise<void>

  // ===================
  // Media
  // ===================

  /** POST /practice-logs/:practiceLogId/media */
  createPracticeLogMedia(
    practiceLogId: string,
    request: CreateMediaRequest,
  ): Promise<Media>;

  /** GET /practice-logs/:practiceLogId/media */
  getPracticeLogMedia(practiceLogId: string): Promise<MediaListResponse>;

  /** DELETE /media/:mediaId */
  deleteMedia(mediaId: string): Promise<void>;

  // ===================
  // Likes
  // ===================

  /** POST /practice-logs/:practiceLogId/likes */
  likePracticeLog(practiceLogId: string): Promise<void>;

  /** DELETE /practice-logs/:practiceLogId/likes */
  unlikePracticeLog(practiceLogId: string): Promise<void>;

  /** GET /practice-logs/:practiceLogId/likes */
  getPracticeLogLikes(practiceLogId: string): Promise<LikesListResponse>;

  // ===================
  // Comments
  // ===================

  /** POST /practice-logs/:practiceLogId/comments */
  createPracticeLogComment(
    practiceLogId: string,
    request: CreateCommentRequest,
  ): Promise<Comment>;
  // used to be: commentOnPracticeLog(practiceLogId, text): Promise<void>

  /** GET /practice-logs/:practiceLogId/comments */
  getPracticeLogComments(practiceLogId: string): Promise<CommentsListResponse>;

  /** DELETE /comments/:commentId */
  deleteComment(commentId: string): Promise<void>;

  // ===================
  // Challenges
  // ===================

  /** GET /challenges */
  getChallenges(): Promise<Challenge[]>;

  /** POST /challenges */
  createChallenge(request: CreateChallengeRequest): Promise<Challenge>;

  /** GET /challenges/:challengeId */
  getChallenge(challengeId: string): Promise<Challenge>;

  /** POST /challenges/:challengeId/complete */
  completeChallenge(challengeId: string): Promise<void>;

  /** GET /users/:userId/completed-challenges */
  getCompletedChallenges(userId: string): Promise<CompletedChallengesResponse>;

  // ===================
  // Notifications
  // ===================

  /** GET /notifications */
  getNotifications(): Promise<NotificationsListResponse>;

  /** PATCH /notifications/:notificationId/read */
  markNotificationRead(notificationId: string): Promise<void>;

  /** DELETE /notifications/:notificationId */
  deleteNotification(notificationId: string): Promise<void>;

  // ===================
  // Events
  // ===================

  /** POST /events */
  createEvent(request: CreateEventRequest): Promise<Event>;

  /** GET /events/:month */
  getEventsForMonth(month: string): Promise<Event[]>;

  /** GET /events/:eventId */
  getEvent(eventId: string): Promise<Event>;

  /** PATCH /events/:eventId */
  updateEvent(eventId: string, request: UpdateEventRequest): Promise<Event>;

  /** DELETE /events/:eventId */
  deleteEvent(eventId: string): Promise<void>;
}
