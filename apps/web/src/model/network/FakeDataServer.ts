import type { KodaServerApi } from "./KodaServerApi";
import type { PostVisibility, User } from "@strava-musician-app/shared";

/** Fake user for demo mode. */
const FAKE_USER: User = {
  id: "demo-user-1",
  username: "demomusician",
  email: "demo@koda.example",
  displayName: "Demo Musician",
  createdAt: new Date("2024-01-15T12:00:00Z"),
};

const fakeUsers: Array<User & { password: string }> = [
  { ...FAKE_USER, password: "password123"}
];
/**
 * Returns fake data for demo/development. No network calls.
 */
export class FakeDataServer implements KodaServerApi {
  async getMe(): Promise<User | null> {
    return { ...FAKE_USER };
  }

  async login(email: string, password: string): Promise<User | null> {
    
    const found = fakeUsers.find(u => u.email === email && u.password == password);
    console.log(found);
    // return found ? { ...found } : null;
    return { ...FAKE_USER }
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      username,
      email,
      displayName: "",
      createdAt: new Date(),
      password,
    };
    fakeUsers.push(newUser);
    return { ...FAKE_USER };
  }

  async savePost(userId: string, title: string, visibility: PostVisibility, duration: number, postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string): Promise<string> {
    const fakeId = `post-${Date.now()}`;
    console.log("[FakeDataServer] Saving post:", fakeId, title);
    return fakeId;
  }
  
  async discardPost(sessionId: string): Promise<void> {
    console.log("[FakeDataServer] Discarding post:", sessionId);
  }


}
