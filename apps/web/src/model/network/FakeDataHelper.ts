import type {
  AuthResponse,
  Challenge,
  Comment,
  CommentsListResponse,
  CompletedChallenge,
  CompletedChallengesResponse,
  CreateChallengeRequest,
  CreateCommentRequest,
  CreateEventRequest,
  CreateMediaRequest,
  CreatePracticeLogRequest,
  Event,
  FeedRequest,
  FeedResponse,
  Friend,
  FriendRequest,
  FriendRequestsPageRequest,
  FriendsListRequest,
  FriendsListResponse,
  IncomingFriendRequestsResponse,
  Like,
  LikesListResponse,
  LoginRequest,
  Media,
  MediaListResponse,
  Notification,
  NotificationEntityType,
  NotificationsListResponse,
  NotificationType,
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

type StoredUser = User & { password: string };

type IdPrefix =
  | "user"
  | "practiceLog"
  | "request"
  | "comment"
  | "media"
  | "challenge"
  | "event"
  | "notification";

const DEFAULT_PAGE_SIZE = 20;

export class FakeDataHelper {
  private users: StoredUser[] = [];
  private practiceLogs: PracticeLog[] = [];
  private friends: Friend[] = [];
  private friendRequests: FriendRequest[] = [];
  private media: Media[] = [];
  private likes: Like[] = [];
  private comments: Comment[] = [];
  private challenges: Challenge[] = [];
  private completedChallenges: CompletedChallenge[] = [];
  private notifications: Notification[] = [];
  private events: Event[] = [];

  private tokenToUserId = new Map<string, string>();
  private currentToken: string | null = null;
  private sequence = 1000;

  constructor() {
    this.seed();
  }

  // ===================
  // Users and Auth
  // ===================

  register(request: RegisterRequest): AuthResponse {
    const normalizedEmail = request.email.trim().toLowerCase();
    if (this.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Email is already registered.");
    }

    const now = this.nowIso();
    const user: StoredUser = {
      userId: this.newId("user"),
      email: normalizedEmail,
      username: request.username.trim(),
      password: request.password,
      postVisibility: "friends",
      instruments: [],
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    const token = this.issueToken(user.userId);
    return { token, user: this.publicUser(user) };
  }

  login(request: LoginRequest): AuthResponse {
    const normalizedEmail = request.email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.password !== request.password) {
      throw new Error("Invalid email or password.");
    }

    const token = this.issueToken(user.userId);
    return { token, user: this.publicUser(user) };
  }

  logout(): void {
    if (this.currentToken) {
      this.tokenToUserId.delete(this.currentToken);
      this.currentToken = null;
    }
  }

  getMe(): User {
    return this.publicUser(this.requireAuthUser());
  }

  getUser(userId: string): User {
    return this.publicUser(this.requireUser(userId));
  }

  updateUser(userId: string, request: UserUpdateRequest): User {
    const me = this.requireAuthUser();
    if (me.userId !== userId) {
      throw new Error("Not authorized to update this user.");
    }

    if (request.username !== undefined) me.username = request.username;
    if (request.bio !== undefined) me.bio = request.bio;
    if (request.profilePhoto !== undefined) me.profilePhoto = request.profilePhoto;
    if (request.instruments !== undefined) me.instruments = [...request.instruments];
    if (request.postVisibility !== undefined) me.postVisibility = request.postVisibility;
    me.updatedAt = this.nowIso();

    return this.publicUser(me);
  }

  getUserPracticeLogs(
    userId: string,
    request: UserPracticeLogsRequest,
  ): UserPracticeLogsResponse {
    const me = this.requireAuthUser();
    this.requireUser(userId);

    const logs = this.practiceLogs
      .filter((log) => log.userId === userId)
      .filter((log) => this.canViewPracticeLog(me.userId, log))
      .sort(this.byCreatedAtDesc);

    return this.paginate(logs, "practiceLogId", request.lastItem, request.pageSize);
  }

  searchUsers(query: string): UserSearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return this.users
      .filter((u) => {
        const haystack = `${u.username} ${u.bio ?? ""} ${u.email}`.toLowerCase();
        return haystack.includes(q);
      })
      .map((u) => ({
        userId: u.userId,
        username: u.username,
        profilePhoto: u.profilePhoto,
        bio: u.bio,
      }));
  }

  // ===================
  // Friends
  // ===================

  upsertFriend(friendId: string): void {
    const me = this.requireAuthUser();
    this.requireUser(friendId);
    if (friendId === me.userId) throw new Error("Cannot friend yourself.");

    if (this.areFriends(me.userId, friendId)) return;

    const incomingPending = this.friendRequests.find(
      (r) =>
        r.senderId === friendId &&
        r.receiverId === me.userId &&
        r.status === "pending",
    );

    if (incomingPending) {
      this.acceptFriendRequest(incomingPending.requestId);
      return;
    }

    this.createFriendRequest(friendId);
  }

  deleteFriend(friendId: string): void {
    const me = this.requireAuthUser();
    this.requireUser(friendId);

    this.friends = this.friends.filter(
      (f) =>
        !(
          (f.userId === me.userId && f.friendId === friendId) ||
          (f.userId === friendId && f.friendId === me.userId)
        ),
    );
  }

  getFriends(request: FriendsListRequest): FriendsListResponse {
    const me = this.requireAuthUser();
    const myFriends = this.friends
      .filter((f) => f.userId === me.userId)
      .sort((a, b) => b.friendsSince.localeCompare(a.friendsSince));

    return this.paginate(myFriends, "friendId", request.lastItem, request.pageSize);
  }

  // ===================
  // Friend Requests
  // ===================

  createFriendRequest(receiverId: string): void {
    const me = this.requireAuthUser();
    this.requireUser(receiverId);
    if (receiverId === me.userId) throw new Error("Cannot send request to yourself.");
    if (this.areFriends(me.userId, receiverId)) {
      throw new Error("Users are already friends.");
    }

    const existing = this.friendRequests.find(
      (r) =>
        r.senderId === me.userId &&
        r.receiverId === receiverId &&
        r.status === "pending",
    );
    if (existing) throw new Error("Friend request already pending.");

    const requestId = this.newId("request");
    const request: FriendRequest = {
      requestId,
      senderId: me.userId,
      receiverId,
      status: "pending",
      createdAt: this.nowIso(),
    };
    this.friendRequests.push(request);

    this.createNotification({
      userId: receiverId,
      actorId: me.userId,
      type: "friendRequest",
      entityType: "user",
      entityId: me.userId,
    });

    // temporary remove later
    this.upsertFriend(receiverId);
  }

  getIncomingFriendRequests(
    request: FriendRequestsPageRequest,
  ): IncomingFriendRequestsResponse {
    const me = this.requireAuthUser();
    const incoming = this.friendRequests
      .filter((r) => r.receiverId === me.userId && r.status === "pending")
      .sort(this.byCreatedAtDesc);

    return this.paginate(incoming, "requestId", request.lastItem, request.pageSize);
  }

  getOutgoingFriendRequests(
    request: FriendRequestsPageRequest,
  ): OutgoingFriendRequestsResponse {
    const me = this.requireAuthUser();
    const outgoing = this.friendRequests
      .filter((r) => r.senderId === me.userId && r.status === "pending")
      .sort(this.byCreatedAtDesc);

    return this.paginate(outgoing, "requestId", request.lastItem, request.pageSize);
  }

  acceptFriendRequest(requestId: string): void {
    const me = this.requireAuthUser();
    const request = this.requireFriendRequest(requestId);
    if (request.receiverId !== me.userId) {
      throw new Error("Not authorized to accept this request.");
    }
    if (request.status !== "pending") {
      throw new Error("Only pending requests can be accepted.");
    }

    request.status = "accepted";
    request.respondedAt = this.nowIso();
    this.ensureFriendPair(request.senderId, request.receiverId);
  }

  rejectFriendRequest(requestId: string): void {
    const me = this.requireAuthUser();
    const request = this.requireFriendRequest(requestId);
    if (request.receiverId !== me.userId) {
      throw new Error("Not authorized to reject this request.");
    }
    if (request.status !== "pending") {
      throw new Error("Only pending requests can be rejected.");
    }
    request.status = "rejected";
    request.respondedAt = this.nowIso();
  }

  cancelFriendRequest(requestId: string): void {
    const me = this.requireAuthUser();
    const request = this.requireFriendRequest(requestId);
    if (request.senderId !== me.userId) {
      throw new Error("Not authorized to cancel this request.");
    }
    if (request.status !== "pending") {
      throw new Error("Only pending requests can be canceled.");
    }
    request.status = "canceled";
    request.respondedAt = this.nowIso();
  }

  // ===================
  // Practice Logs
  // ===================

  createPracticeLog(request: CreatePracticeLogRequest): PracticeLog {
    const me = this.requireAuthUser();
    const log: PracticeLog = {
      practiceLogId: this.newId("practiceLog"),
      userId: me.userId,
      title: request.title,
      postText: request.postText,
      privateText: request.privateText,
      instrument: request.instrument,
      durationMinutes: request.durationMinutes,
      tempo: request.tempo,
      pieceTitle: request.pieceTitle,
      composer: request.composer,
      createdAt: this.nowIso(),
    };

    this.practiceLogs.push(log);
    return { ...log };
  }

  getPracticeLogsFeed(request: FeedRequest): FeedResponse {
    const me = this.requireAuthUser();
    const visible = this.practiceLogs
      .filter((log) => this.canViewPracticeLog(me.userId, log))
      .sort(this.byCreatedAtDesc);

    return this.paginate(visible, "practiceLogId", request.lastItem, request.pageSize);
  }

  getPracticeLog(practiceLogId: string): PracticeLog {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to view this practice log.");
    }
    return { ...log };
  }

  updatePracticeLog(
    practiceLogId: string,
    request: UpdatePracticeLogRequest,
  ): PracticeLog {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (log.userId !== me.userId) {
      throw new Error("Not authorized to update this practice log.");
    }

    Object.assign(log, {
      title: request.title ?? log.title,
      postText: request.postText ?? log.postText,
      privateText: request.privateText ?? log.privateText,
      instrument: request.instrument ?? log.instrument,
      durationMinutes: request.durationMinutes ?? log.durationMinutes,
      tempo: request.tempo ?? log.tempo,
      pieceTitle: request.pieceTitle ?? log.pieceTitle,
      composer: request.composer ?? log.composer,
    });

    return { ...log };
  }

  deletePracticeLog(practiceLogId: string): void {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (log.userId !== me.userId) {
      throw new Error("Not authorized to delete this practice log.");
    }

    this.practiceLogs = this.practiceLogs.filter((p) => p.practiceLogId !== practiceLogId);
    this.likes = this.likes.filter((l) => l.practiceLogId !== practiceLogId);
    this.comments = this.comments.filter((c) => c.practiceLogId !== practiceLogId);
    this.media = this.media.filter((m) => m.practiceLogId !== practiceLogId);
    this.notifications = this.notifications.filter(
      (n) =>
        !(
          n.entityType === "practiceLog" &&
          n.entityId === practiceLogId
        ),
    );
  }

  // ===================
  // Media
  // ===================

  createPracticeLogMedia(
    practiceLogId: string,
    request: CreateMediaRequest,
  ): Media {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (log.userId !== me.userId) {
      throw new Error("Not authorized to attach media to this practice log.");
    }

    const media: Media = {
      mediaId: this.newId("media"),
      practiceLogId,
      type: request.type,
      url: request.url,
      createdAt: this.nowIso(),
    };
    this.media.push(media);
    return { ...media };
  }

  getPracticeLogMedia(practiceLogId: string): MediaListResponse {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to view media for this practice log.");
    }
    return this.media
      .filter((m) => m.practiceLogId === practiceLogId)
      .sort(this.byCreatedAtDesc)
      .map((m) => ({ ...m }));
  }

  deleteMedia(mediaId: string): void {
    const me = this.requireAuthUser();
    const media = this.media.find((m) => m.mediaId === mediaId);
    if (!media) throw new Error("Media not found.");

    const log = this.requirePracticeLog(media.practiceLogId);
    if (log.userId !== me.userId) {
      throw new Error("Not authorized to delete this media.");
    }

    this.media = this.media.filter((m) => m.mediaId !== mediaId);
  }

  // ===================
  // Likes
  // ===================

  likePracticeLog(practiceLogId: string): void {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to like this practice log.");
    }
    const existing = this.likes.find(
      (l) => l.practiceLogId === practiceLogId && l.userId === me.userId,
    );
    if (existing) throw new Error("Practice log already liked.");

    this.likes.push({
      userId: me.userId,
      practiceLogId,
      createdAt: this.nowIso(),
    });

    if (log.userId !== me.userId) {
      this.createNotification({
        userId: log.userId,
        actorId: me.userId,
        type: "like",
        entityType: "practiceLog",
        entityId: practiceLogId,
      });
    }
  }

  unlikePracticeLog(practiceLogId: string): void {
    const me = this.requireAuthUser();
    const existing = this.likes.find(
      (l) => l.practiceLogId === practiceLogId && l.userId === me.userId,
    );
    if (!existing) throw new Error("Like does not exist.");

    this.likes = this.likes.filter(
      (l) => !(l.practiceLogId === practiceLogId && l.userId === me.userId),
    );
  }

  getPracticeLogLikes(practiceLogId: string): LikesListResponse {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to view likes.");
    }
    return this.likes
      .filter((l) => l.practiceLogId === practiceLogId)
      .sort(this.byCreatedAtDesc)
      .map((l) => ({ ...l }));
  }

  // ===================
  // Comments
  // ===================

  createPracticeLogComment(
    practiceLogId: string,
    request: CreateCommentRequest,
  ): Comment {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to comment on this practice log.");
    }

    const comment: Comment = {
      commentId: this.newId("comment"),
      practiceLogId,
      userId: me.userId,
      text: request.text,
      createdAt: this.nowIso(),
    };
    this.comments.push(comment);

    if (log.userId !== me.userId) {
      this.createNotification({
        userId: log.userId,
        actorId: me.userId,
        type: "comment",
        entityType: "practiceLog",
        entityId: practiceLogId,
      });
    }

    return { ...comment };
  }

  getPracticeLogComments(practiceLogId: string): CommentsListResponse {
    const me = this.requireAuthUser();
    const log = this.requirePracticeLog(practiceLogId);
    if (!this.canViewPracticeLog(me.userId, log)) {
      throw new Error("Not authorized to view comments.");
    }
    return this.comments
      .filter((c) => c.practiceLogId === practiceLogId)
      .sort(this.byCreatedAtDesc)
      .map((c) => ({ ...c }));
  }

  deleteComment(commentId: string): void {
    const me = this.requireAuthUser();
    const comment = this.comments.find((c) => c.commentId === commentId);
    if (!comment) throw new Error("Comment not found.");
    if (comment.userId !== me.userId) throw new Error("Not authorized to delete comment.");

    this.comments = this.comments.filter((c) => c.commentId !== commentId);
  }

  // ===================
  // Challenges
  // ===================

  getChallenges(): Challenge[] {
    this.requireAuthUser();
    return this.challenges.map((c) => ({ ...c }));
  }

  createChallenge(request: CreateChallengeRequest): Challenge {
    this.requireAuthUser();
    const challenge: Challenge = {
      challengeId: this.newId("challenge"),
      description: request.description,
      task: request.task,
      targetNumber: request.targetNumber,
      instrument: request.instrument,
    };
    this.challenges.push(challenge);
    return { ...challenge };
  }

  getChallenge(challengeId: string): Challenge {
    this.requireAuthUser();
    const challenge = this.challenges.find((c) => c.challengeId === challengeId);
    if (!challenge) throw new Error("Challenge not found.");
    return { ...challenge };
  }

  completeChallenge(challengeId: string): void {
    const me = this.requireAuthUser();
    this.getChallenge(challengeId);

    const exists = this.completedChallenges.find(
      (c) => c.challengeId === challengeId && c.userId === me.userId,
    );
    if (exists) throw new Error("Challenge already completed.");

    this.completedChallenges.push({
      userId: me.userId,
      challengeId,
      completedAt: this.nowIso(),
    });

    this.createNotification({
      userId: me.userId,
      actorId: me.userId,
      type: "challengeCompleted",
      entityType: "challenge",
      entityId: challengeId,
    });
  }

  getCompletedChallenges(userId: string): CompletedChallengesResponse {
    this.requireAuthUser();
    this.requireUser(userId);
    return this.completedChallenges
      .filter((c) => c.userId === userId)
      .sort(this.byCompletedAtDesc)
      .map((c) => ({ ...c }));
  }

  // ===================
  // Notifications
  // ===================

  getNotifications(): NotificationsListResponse {
    const me = this.requireAuthUser();
    return this.notifications
      .filter((n) => n.userId === me.userId)
      .sort(this.byCreatedAtDesc)
      .map((n) => ({ ...n }));
  }

  markNotificationRead(notificationId: string): void {
    const me = this.requireAuthUser();
    const notification = this.notifications.find((n) => n.notificationId === notificationId);
    if (!notification) throw new Error("Notification not found.");
    if (notification.userId !== me.userId) {
      throw new Error("Not authorized to update this notification.");
    }
    notification.isRead = true;
  }

  deleteNotification(notificationId: string): void {
    const me = this.requireAuthUser();
    const notification = this.notifications.find((n) => n.notificationId === notificationId);
    if (!notification) throw new Error("Notification not found.");
    if (notification.userId !== me.userId) {
      throw new Error("Not authorized to delete this notification.");
    }
    this.notifications = this.notifications.filter((n) => n.notificationId !== notificationId);
  }

  // ===================
  // Events
  // ===================

  createEvent(request: CreateEventRequest): Event {
    const me = this.requireAuthUser();
    const event: Event = {
      eventId: this.newId("event"),
      title: request.title,
      description: request.description,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      isAllDay: request.isAllDay,
      location: request.location,
      reminderMinBefore: request.reminderMinBefore,
      eventType: request.eventType,
      visibility: request.visibility,
    };

    this.events.push({
      ...event,
      // pseudo owner encoding for mock auth checks
      title: `${me.userId}::${event.title}`,
    });

    return event;
  }

  getEventsForMonth(month: string): Event[] {
    const me = this.requireAuthUser();
    return this.events
      .filter((event) => event.date.startsWith(month))
      .filter((event) => this.canViewEvent(me.userId, event))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((event) => this.publicEvent(event));
  }

  getEvent(eventId: string): Event {
    const me = this.requireAuthUser();
    const event = this.events.find((e) => e.eventId === eventId);
    if (!event) throw new Error("Event not found.");
    if (!this.canViewEvent(me.userId, event)) {
      throw new Error("Not authorized to view this event.");
    }
    return this.publicEvent(event);
  }

  updateEvent(eventId: string, request: UpdateEventRequest): Event {
    const me = this.requireAuthUser();
    const event = this.events.find((e) => e.eventId === eventId);
    if (!event) throw new Error("Event not found.");
    if (this.eventOwnerId(event) !== me.userId) {
      throw new Error("Not authorized to update this event.");
    }

    Object.assign(event, {
      description: request.description ?? event.description,
      date: request.date ?? event.date,
      startTime: request.startTime ?? event.startTime,
      endTime: request.endTime ?? event.endTime,
      isAllDay: request.isAllDay ?? event.isAllDay,
      location: request.location ?? event.location,
      reminderMinBefore: request.reminderMinBefore ?? event.reminderMinBefore,
      eventType: request.eventType ?? event.eventType,
      visibility: request.visibility ?? event.visibility,
    });

    if (request.title !== undefined) {
      event.title = `${me.userId}::${request.title}`;
    }

    return this.publicEvent(event);
  }

  deleteEvent(eventId: string): void {
    const me = this.requireAuthUser();
    const event = this.events.find((e) => e.eventId === eventId);
    if (!event) throw new Error("Event not found.");
    if (this.eventOwnerId(event) !== me.userId) {
      throw new Error("Not authorized to delete this event.");
    }
    this.events = this.events.filter((e) => e.eventId !== eventId);
  }

  // ===================
  // Shared helpers
  // ===================

  private requireAuthUser(): StoredUser {
    const userId = this.currentToken ? this.tokenToUserId.get(this.currentToken) : null;
    if (!userId) throw new Error("Not authenticated.");
    return this.requireUser(userId);
  }

  private requireUser(userId: string): StoredUser {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) throw new Error("User not found.");
    return user;
  }

  private requirePracticeLog(practiceLogId: string): PracticeLog {
    const log = this.practiceLogs.find((p) => p.practiceLogId === practiceLogId);
    if (!log) throw new Error("Practice log not found.");
    return log;
  }

  private requireFriendRequest(requestId: string): FriendRequest {
    const request = this.friendRequests.find((r) => r.requestId === requestId);
    if (!request) throw new Error("Friend request not found.");
    return request;
  }

  private publicUser(user: StoredUser): User {
    const { password: _password, ...publicUser } = user;
    return { ...publicUser };
  }

  private canViewPracticeLog(viewerId: string, log: PracticeLog): boolean {
    if (viewerId === log.userId) return true;
    const owner = this.requireUser(log.userId);
    if (owner.postVisibility === "public") return true;
    if (owner.postVisibility === "friends") return this.areFriends(viewerId, owner.userId);
    return false;
  }

  private canViewEvent(viewerId: string, event: Event): boolean {
    const ownerId = this.eventOwnerId(event);
    if (viewerId === ownerId) return true;
    if (event.visibility === "public") return true;
    if (event.visibility === "friends") return this.areFriends(viewerId, ownerId);
    return false;
  }

  private eventOwnerId(event: Event): string {
    const [ownerId] = event.title.split("::");
    return ownerId;
  }

  private publicEvent(event: Event): Event {
    const [, ...titleParts] = event.title.split("::");
    return {
      ...event,
      title: titleParts.join("::") || event.title,
    };
  }

  private createNotification(params: {
    userId: string;
    actorId: string;
    type: NotificationType;
    entityType: NotificationEntityType;
    entityId: string;
  }): void {
    const notification: Notification = {
      notificationId: this.newId("notification"),
      userId: params.userId,
      actorId: params.actorId,
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      createdAt: this.nowIso(),
      isRead: false,
    };
    this.notifications.push(notification);
  }

  private ensureFriendPair(userA: string, userB: string): void {
    const friendsSince = this.nowIso();
    const add = (userId: string, friendId: string) => {
      if (this.friends.some((f) => f.userId === userId && f.friendId === friendId)) return;
      this.friends.push({ userId, friendId, friendsSince });
    };

    add(userA, userB);
    add(userB, userA);
  }

  private areFriends(userA: string, userB: string): boolean {
    return this.friends.some((f) => f.userId === userA && f.friendId === userB);
  }

  private paginate<T extends object>(
    data: T[],
    itemKey: keyof T,
    lastItem: string | undefined,
    pageSize: number | undefined,
  ): T[] {
    const safePageSize = pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
    const startIndex = lastItem
      ? data.findIndex((item) => String(item[itemKey as keyof T]) === lastItem) + 1
      : 0;
    const paged = data.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + safePageSize);
    return paged.map((item) => ({ ...item }));
  }

  private byCreatedAtDesc<T extends { createdAt: string }>(a: T, b: T): number {
    return b.createdAt.localeCompare(a.createdAt);
  }

  private byCompletedAtDesc(
    a: CompletedChallenge,
    b: CompletedChallenge,
  ): number {
    return b.completedAt.localeCompare(a.completedAt);
  }

  private issueToken(userId: string): string {
    const token = `fake-token-${userId}-${this.sequence++}`;
    this.currentToken = token;
    this.tokenToUserId.set(token, userId);
    return token;
  }

  private newId(prefix: IdPrefix): string {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private seed(): void {
    const seedUsers: StoredUser[] = [
      {
        userId: "demo-user-1",
        email: "demo1@koda.example",
        username: "demomusician",
        password: "password123",
        postVisibility: "public",
        instruments: ["Piano"],
        bio: "Daily scales and etudes",
        createdAt: "2026-02-10T08:00:00.000Z",
        updatedAt: "2026-02-10T08:00:00.000Z",
      },
      {
        userId: "demo-user-2",
        email: "demo2@koda.example",
        username: "violinist",
        password: "password123",
        postVisibility: "friends",
        instruments: ["Violin"],
        bio: "Practicing concertos",
        createdAt: "2026-02-10T08:10:00.000Z",
        updatedAt: "2026-02-10T08:10:00.000Z",
      },
      {
        userId: "demo-user-3",
        email: "demo3@koda.example",
        username: "clarinetkid",
        password: "password123",
        postVisibility: "private",
        instruments: ["Clarinet"],
        bio: "Orchestral excerpts",
        createdAt: "2026-02-10T08:20:00.000Z",
        updatedAt: "2026-02-10T08:20:00.000Z",
      },
      {
        userId: "demo-user-4",
        email: "demo4@koda.example",
        username: "jazzcat",
        password: "password123",
        postVisibility: "public",
        instruments: ["Saxophone"],
        bio: "Improvisation and groove",
        createdAt: "2026-02-10T08:30:00.000Z",
        updatedAt: "2026-02-10T08:30:00.000Z",
      },
    ];
    this.users = seedUsers;

    this.practiceLogs = [
      {
        practiceLogId: "practiceLog-101",
        userId: "demo-user-1",
        title: "Morning technique",
        postText: "Arpeggios and slow practice",
        privateText: "Need cleaner LH fingering",
        instrument: "Piano",
        createdAt: "2026-03-15T09:00:00.000Z",
        durationMinutes: 60,
      },
      {
        practiceLogId: "practiceLog-102",
        userId: "demo-user-2",
        title: "Etude work",
        postText: "Kreutzer no.2 at 76 bpm",
        instrument: "Violin",
        createdAt: "2026-03-14T14:00:00.000Z",
        durationMinutes: 45,
        tempo: 76,
        pieceTitle: "Etude in E Major",
        composer: "Fredric Chopin"
      },
      {
        practiceLogId: "practiceLog-103",
        userId: "demo-user-3",
        title: "Excerpt session",
        postText: "Rite of Spring opening",
        instrument: "Clarinet",
        createdAt: "2026-03-13T12:00:00.000Z",
        durationMinutes: 30,
      },
    ];

    this.friends = [
      {
        userId: "demo-user-1",
        friendId: "demo-user-2",
        friendsSince: "2026-03-01T10:00:00.000Z",
      },
      {
        userId: "demo-user-2",
        friendId: "demo-user-1",
        friendsSince: "2026-03-01T10:00:00.000Z",
      },
    ];

    this.friendRequests = [
      {
        requestId: "request-201",
        senderId: "demo-user-4",
        receiverId: "demo-user-1",
        status: "pending",
        createdAt: "2026-03-16T08:00:00.000Z",
      },
    ];

    this.likes = [
      {
        userId: "demo-user-2",
        practiceLogId: "practiceLog-101",
        createdAt: "2026-03-15T10:00:00.000Z",
      },
    ];

    this.comments = [
      {
        commentId: "comment-301",
        practiceLogId: "practiceLog-101",
        userId: "demo-user-2",
        text: "Great consistency!",
        createdAt: "2026-03-15T10:05:00.000Z",
      },
    ];

    this.media = [
      {
        mediaId: "media-401",
        practiceLogId: "practiceLog-101",
        type: "audio",
        url: "https://example.com/audio.mp3",
        createdAt: "2026-03-15T10:10:00.000Z",
      },
    ];

    this.challenges = [
      {
        challengeId: "challenge-501",
        description: "Practice 5 sessions this week",
        task: "numPracticeSessions",
        targetNumber: 5,
      },
      {
        challengeId: "challenge-502",
        description: "Record 2 videos",
        task: "numVideoRecordings",
        targetNumber: 2,
      },
    ];

    this.completedChallenges = [
      {
        userId: "demo-user-1",
        challengeId: "challenge-501",
        completedAt: "2026-03-12T18:00:00.000Z",
      },
    ];

    this.notifications = [
      {
        notificationId: "notification-601",
        userId: "demo-user-1",
        actorId: "demo-user-2",
        type: "like",
        entityType: "practiceLog",
        entityId: "practiceLog-101",
        createdAt: "2026-03-15T10:00:00.000Z",
        isRead: false,
      },
      {
        notificationId: "notification-602",
        userId: "demo-user-1",
        actorId: "demo-user-4",
        type: "friendRequest",
        entityType: "user",
        entityId: "demo-user-4",
        createdAt: "2026-03-16T08:00:00.000Z",
        isRead: false,
      },
    ];

    this.events = [
      {
        eventId: "event-701",
        title: "demo-user-1::Studio rehearsal",
        description: "Run set list",
        date: "2026-03-20",
        startTime: "18:00",
        endTime: "20:00",
        isAllDay: false,
        location: "Room 2",
        reminderMinBefore: 30,
        eventType: "practice",
        visibility: "friends",
      },
      {
        eventId: "event-702",
        title: "demo-user-4::Open mic",
        description: "Local venue set",
        date: "2026-03-25",
        startTime: "19:30",
        endTime: "21:00",
        isAllDay: false,
        location: "Blue Note",
        reminderMinBefore: 60,
        eventType: "performance",
        visibility: "public",
      },
    ];

    this.sequence = 800;
    this.issueToken("demo-user-1");
  }
}
