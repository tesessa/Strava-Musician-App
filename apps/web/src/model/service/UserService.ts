import type { KodaServerApi } from "../network/KodaServerApi";
import type { 
  User, 
  Visibility,
  UserPracticeLogsResponse,
  UserSearchResult
 } from "@strava-musician-app/shared";

/**
 * User/auth-related business logic. Receives KodaServerApi via dependency injection.
 * Components and hooks receive this service (or other services) rather than the server directly.
 */
export class UserService {
  private currentUser: User | null = null;
  constructor(private readonly server: KodaServerApi) {}

  /** POST /auth/register */
  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<User | null> {
    const auth = await this.server.register({ username, email, password });
    const user = auth.user ?? null;
    this.currentUser = user;
    return user;
  }

  /** POST /auth/login */
  async login(email: string, password: string): Promise<User | null> {
    const auth = await this.server.login({ email, password });
    const user = auth.user ?? null;
    this.currentUser = user;
    return user;
  }

  /** POST /auth/logout */
  async logout(): Promise<void> {
    await this.server.logout();
    this.currentUser = null;
  }

  /** GET /auth/me */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const user = await this.server.getMe();
    this.currentUser = user;
    return user;
  }

   /** GET /users/:userId */
  async getUser(userId: string): Promise<User> {
    return this.server.getUser(userId);
  }


  //   username?: string;
  // bio?: string;
  // profilePhoto?: string;
  // instruments?: string[];
  // postVisibility?: Visibility;

  /** PATCH /users/:userId */
  async updateUser(
    userId: string,
    username?: string,
    bio?: string,
    profilePhoto?: string,
    instruments?: string[],
    postVisibility?: Visibility,
  ): Promise<User> {
    return this.server.updateUser(userId, {
      username,
      bio,
      profilePhoto,
      instruments,
      postVisibility,
    });
  }

  /** GET /users/:userId/practice-logs (keyset pagination) */
  async getUserPracticeLogs(
    userId: string,
    lastItemId?: string,
    pageSize?: number
  ): Promise<UserPracticeLogsResponse> {
    return this.server.getUserPracticeLogs(userId, {lastItemId, pageSize })
  }

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    return this.server.searchUsers(query);
  }

  /** GET /users/search?query=... */
  async refreshCurrentUser(): Promise<User | null> {
    const user = await this.server.getMe();
    this.currentUser = user;

    return user;
  }
}
