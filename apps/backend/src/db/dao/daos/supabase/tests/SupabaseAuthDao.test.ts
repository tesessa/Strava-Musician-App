import { SupabaseAuthDao } from "../SupabaseAuthDao";
import db from "../config/SupabaseKnexConnection";
import { randomUUID } from "crypto";
//import { User } from "@strava-musician-app/shared";

describe("SupabaseAuthDao", () => {
  const authDao = new SupabaseAuthDao();
  const testUserId = randomUUID();
  beforeAll(async () => {
    // Clear the AuthSession table before running tests
    await db("AuthSession").del();
    // Clear the User table before running tests
    await db("User").del();
    // create base user
    await db("User").insert({
      id: testUserId,
      email: "test@example.com",
      username: "testuser",
      password: "hashedpassword",
      image_url: "",
      bio: "",
      post_visibility: "private",
      instruments: [],
    });
  });

  it("should create a token for user and find user by token", async () => {
    const authToken = await authDao.createTokenForUser(testUserId);
    expect(authToken).toHaveProperty("token");
    expect(authToken).toHaveProperty("timestamp");
    const user = await authDao.getUserByToken(authToken.token);
    expect(user).toMatchObject({
      userId: testUserId,
      email: "test@example.com",
      username: "testuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should refresh token", async () => {
    const authToken = await authDao.createTokenForUser(testUserId);
    const oldTimestamp = authToken.timestamp;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second to ensure timestamp will be different
    await authDao.refreshSession(authToken.token);
    const user = await authDao.getUserByToken(authToken.token);
    expect(user).toMatchObject({
      userId: testUserId,
      email: "test@example.com",
      username: "testuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    const newTimeStamp = await authDao.getTokenExpiration(authToken.token);
    expect(newTimeStamp).not.toBeNull();
    expect(newTimeStamp!.getTime()).toBeGreaterThan(oldTimestamp.getTime());
  });

  it("should check and refresh token", async () => {
    const authToken = await authDao.createTokenForUser(testUserId);
    const isValid = await authDao.checkAndRefreshSession(authToken.token);
    expect(isValid).toBe(true);
  });

  it("should not refresh expired token", async () => {
    // mock TOKEN_TTL_MS to be very short for testing
    const originalTokenTtl = (authDao as any).TOKEN_TTL_MS;
    (authDao as any).TOKEN_TTL_MS = 1000; // 1 second

    const authToken = await authDao.createTokenForUser(testUserId);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds to ensure token is expired
    const isValid = await authDao.checkAndRefreshSession(authToken.token);
    expect(isValid).toBe(false);

    // restore original TOKEN_TTL_MS
    (authDao as any).TOKEN_TTL_MS = originalTokenTtl;
  });

  it("should revoke token", async () => {
    const authToken = await authDao.createTokenForUser(testUserId);
    await authDao.revokeToken(authToken.token);
    const user = await authDao.getUserByToken(authToken.token);
    expect(user).toBeNull();
    const expiration = await authDao.getTokenExpiration(authToken.token);
    expect(expiration).toBeNull();
  });

  it("should clean up expired tokens", async () => {
    // mock TOKEN_TTL_MS to be very short for testing
    const originalTokenTtl = (authDao as any).TOKEN_TTL_MS;
    (authDao as any).TOKEN_TTL_MS = 1000; // 1 second

    const authToken = await authDao.createTokenForUser(testUserId);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds to ensure token is expired
    await authDao.cleanupExpiredSessions();
    const user = await authDao.getUserByToken(authToken.token);
    expect(user).toBeNull();

    // restore original TOKEN_TTL_MS
    (authDao as any).TOKEN_TTL_MS = originalTokenTtl;
  });

  afterAll(async () => {
    await db.destroy();
  });
});
