import { ClientCommunicator } from "./ClientCommunicator";
import type { KodaServerApi } from "./KodaServerApi";
// import type { User } from "@strava-musician-app/shared";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  imageUrl?: string;
  bio?: string;
  instruments?: string[];
}

interface AuthResponse {
  token: string;
  expiresAt: number;
  user: User;
}

interface userResponse {
  user: User;
}
import type { User, Visibility, PracticeSession } from "@strava-musician-app/shared";

/**
 * Calls the actual Koda API. Uses Client Communicator for HTTP.
 * Stub: real HTTP calls to be wired when backend is ready.
 */
export class ServerFacade implements KodaServerApi {
  private SERVER_URL = "http://localhost:3001" // would be nice to switch this to .env variable
  private communicator = new ClientCommunicator(this.SERVER_URL);
  // private SERVER_URL = "";
  // private communicator = new ClientCommunicator(this.SERVER_URL);
  private authToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  consructor() {
    this.loadAuthToken();
  }

  private getAuthHeaders(): Headers {
    const headers = new Headers();
    if (this.authToken) {
      headers.append("Authorization", `Bearer ${this.authToken}`);
    }
    return headers;
  }

  private setAuthToken(token: string, expiresAt: number): void {
    this.authToken = token;
    this.tokenExpiresAt = expiresAt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    }
  }

  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      if (token && expiresAt) {
        const expiresAtNum = parseInt(expiresAt, 10);
        // Check if token is still valid
        if (Date.now() < expiresAtNum) {
          this.authToken = token;
          this.tokenExpiresAt = expiresAtNum;
        } else {
          // Token expired, clear it
          this.clearAuthToken();
        }
      }
    }
  }

  private clearAuthToken(): void {
    this.authToken = null;
    this.tokenExpiresAt = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiresAt');
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    return Date.now() >= this.tokenExpiresAt;
  }



  async getMe(): Promise<User | null> {
    try {
      if (this.isTokenExpired()) {
        this.clearAuthToken();
        return null;
      }

      const response = await this.communicator.get<{user: User}>(
        "/auth/me",
        this.getAuthHeaders()
      );
      return response.user;
    } catch (error) {
      console.error("[ServerFacade] getMe failed:", error);
      this.clearAuthToken();
      return null;
    }
    // TODO: use Client Communicator to call GET /auth/me with stored token
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const request: LoginRequest = { email, password };
      const response = await this.communicator.post<LoginRequest, AuthResponse>(
        request,
        "/auth/login"
      );

      this.setAuthToken(response.token, response.expiresAt);
      return response.user;
    } catch (error) {
      console.error("[ServerFacade] login failed:", error);
      return null;
    }
  }

  async register(username: string, email: string, password: string): Promise<User> {
    console.log(username, email);
    try {
      const request: RegisterRequest = { username, email, password };
      
      const response = await this.communicator.post<RegisterRequest, AuthResponse>(
        request,
        "/auth/register"
      );

      // Store auth token if provided
      this.setAuthToken(response.token, response.expiresAt);
      
      return response.user;
    } catch (error) {
      console.error("[ServerFacade] register failed:", error);
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  async savePost(_userId: string, title: string, _visibility: Visibility, _duration: number, _postText?: string, _privateText?: string, _instrument?: string, _tempo?: number, _pieceTitle?: string, _composer?: string): Promise<string> {
    return title;
  }

  async discardPost(_sessionId: string): Promise<void> {}

  async getFeed(): Promise<PracticeSession[]> {
    return [];
  }

  async likePost(postId: string): Promise<void> {
    console.log("TODO real likePost", postId);
  }

  async unlikePost(postId: string): Promise<void> {
    console.log("TODO real unlikePost", postId);
  }

  async commentOnPost(postId: string, text: string): Promise<void> {
    console.log("TODO real commentOnPost", postId, text);
  }

  async sharePost(postId: string): Promise<void> {
    console.log("TODO real sharePost", postId);
  }

}
