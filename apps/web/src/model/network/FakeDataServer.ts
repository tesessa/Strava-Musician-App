import type { KodaServerApi } from "./KodaServerApi";
import type { User, Visibility } from "@strava-musician-app/shared";

/** Fake user for demo mode. */
const FAKE_USER: User = {
  userId: "demo-user-1",
  username: "demomusician",
  email: "demo@koda.example",
  postVisibility: "public",
  instruments: [],
  createdAt: "2024-01-15T12:00:00.000Z",
  updatedAt: "2024-01-15T12:00:00.000Z",
};

const fakeUsers: Array<User & { password: string }> = [
  { ...FAKE_USER, password: "password123" },
];
/**
 * Returns fake data for demo/development. No network calls.
 */
export class FakeDataServer implements KodaServerApi {
  async getMe(): Promise<User | null> {
    return { ...FAKE_USER };
  }

  async login(email: string, password: string): Promise<User | null> {
    const found = fakeUsers.find((u) => u.email === email && u.password === password);
    return found
      ? {
          userId: found.userId,
          username: found.username,
          email: found.email,
          postVisibility: found.postVisibility,
          instruments: found.instruments,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
        }
      : null;
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User & { password: string } = {
      userId: `user-${Date.now()}`,
      username,
      email,
      postVisibility: "friends",
      instruments: [],
      createdAt: now,
      updatedAt: now,
      password,
    };
    fakeUsers.push(newUser);
    return {
      userId: newUser.userId,
      username: newUser.username,
      email: newUser.email,
      postVisibility: newUser.postVisibility,
      instruments: newUser.instruments,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async savePost(userId: string, title: string, _visibility: Visibility, _duration: number, _postText?: string, _privateText?: string, _instrument?: string, _tempo?: number, _pieceTitle?: string, _composer?: string): Promise<string> {
    const fakeId = `post-${Date.now()}`;
    console.log("[FakeDataServer] Saving post:", fakeId, title, "for user", userId);
    return fakeId;
  }

  async discardPost(sessionId: string): Promise<void> {
    console.log("[FakeDataServer] Discarding post:", sessionId);
  }


}
