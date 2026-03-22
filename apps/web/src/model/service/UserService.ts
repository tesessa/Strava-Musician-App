import type { KodaServerApi } from "../network/KodaServerApi";
import type { User, Visibility } from "@strava-musician-app/shared";

/**
 * User/auth-related business logic. Receives KodaServerApi via dependency injection.
 * Components and hooks receive this service (or other services) rather than the server directly.
 */
export class UserService {
  private currentUser: User | null = null;
  constructor(private readonly server: KodaServerApi) {}

  /** Get the currently authenticated user (delegates to server). */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const user = await this.server.getMe();
    this.currentUser = user;
    return user;
  }

  async getUser(userId: string): Promise<User> {
    return this.server.getUser(userId);
  }

  async login(email: string, password: string): Promise<User | null> {
    const auth = await this.server.login({ email, password });
    const user = auth.user ?? null;
    this.currentUser = user;
    return user;
  }

  async register(username: string, email: string, password: string): Promise<User | null> {
    const auth = await this.server.register({ username, email, password });
    const user = auth.user ?? null;
    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    await this.server.logout();
    this.currentUser = null;
  }

  //   username?: string;
  // bio?: string;
  // profilePhoto?: string;
  // instruments?: string[];
  // postVisibility?: Visibility;
  updateUser(
    userId: string, 
    username?: string, 
    bio?: string,  
    profilePhoto?: string,
    instruments?: string[],
    postVisibility?: Visibility
  ): Promise<User> {
    return this.server.updateUser(userId, {username, bio, profilePhoto, instruments, postVisibility});
  }
}
