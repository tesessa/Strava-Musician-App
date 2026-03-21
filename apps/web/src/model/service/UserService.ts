import type { KodaServerApi } from "../network/KodaServerApi";
import type { AuthResponse, LoginRequest, RegisterRequest, User, UserUpdateRequest } from "@strava-musician-app/shared";

/**
 * User/auth-related business logic. Receives KodaServerApi via dependency injection.
 * Components and hooks receive this service (or other services) rather than the server directly.
 */
export class UserService {
  private currentUser: User | undefined = undefined;
  constructor(private readonly server: KodaServerApi) {}

  /** Get the currently authenticated user (delegates to server). */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const user = await this.server.getMe();
    this.currentUser = user;
    return user;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    // should return user & authToken (to be implemented later)
    const { token, user} = await this.server.login(request);
    this.currentUser = user;
    return {token, user};
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    // should return user & authToken (to be implemented later)
    const { token, user} = await this.server.register(request)
    // const user = await this.server.register(username, email, password);
    this.currentUser = user;
    return { token, user };
  }

  async logout(): Promise<void> {
    await this.server.logout();
    this.currentUser = undefined;
  }

  async updateUser(userId: string, request: UserUpdateRequest): Promise<User> {
    return this.server.updateUser(userId, request);
  }
}
