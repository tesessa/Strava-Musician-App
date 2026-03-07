import type { KodaServerApi } from "./KodaServerApi";
import type { User, Visibility } from "@strava-musician-app/shared";

/**
 * Calls the actual Koda API. Uses Client Communicator for HTTP.
 * Stub: real HTTP calls to be wired when backend is ready.
 */
export class ServerFacade implements KodaServerApi {
  async getMe(): Promise<User | null> {
    // TODO: use Client Communicator to call GET /auth/me with stored token
    return null;
  }

  async login(_email: string, _password: string): Promise<User | null> {
    return null;
  }

  async register(_username: string, email: string, _password: string): Promise<User> {
    return {
      userId: "1",
      username: _username,
      email,
      postVisibility: "friends",
      instruments: [],
    };
  }

  async savePost(_userId: string, title: string, _visibility: Visibility, _duration: number, _postText?: string, _privateText?: string, _instrument?: string, _tempo?: number, _pieceTitle?: string, _composer?: string): Promise<string> {
    return title;
  }

  async discardPost(_sessionId: string): Promise<void> {}


}
