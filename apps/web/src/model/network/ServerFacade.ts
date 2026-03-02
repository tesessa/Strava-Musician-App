import type { KodaServerApi } from "./KodaServerApi";
import type { PostVisibility, User, FeedPost } from "@strava-musician-app/shared";

/**
 * Calls the actual Koda API. Uses Client Communicator for HTTP.
 * Stub: real HTTP calls to be wired when backend is ready.
 */
export class ServerFacade implements KodaServerApi {
  async getMe(): Promise<User | null> {
    // TODO: use Client Communicator to call GET /auth/me with stored token
    return null;
  }

  async login(email: string, password: string): Promise<User | null> {
    return null;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    return {
      id: "1",
      username: username,
      email: email,
      displayName: "Demo Musician",
      createdAt: new Date("2024-01-15T12:00:00Z"),
    }
  }

  async savePost(userId: string, title: string, visibility: PostVisibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string> {
    return title;
  }

  async discardPost(sessionId: string): Promise<void> {

  }

  async getFeed(): Promise<FeedPost[]> {
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
