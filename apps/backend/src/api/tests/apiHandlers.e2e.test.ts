import request from "supertest";

const API = "http://localhost:3001";

let authToken: string;
let userId: string;
let practiceLogId: string;
let secondUserToken: string;
let secondUserId: string;
let deletedPracticeLogId: string;

describe("API Handlers Integration (Comprehensive)", () => {
  // --- AUTH ---
  it("should fail to register with missing fields", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({ email: "bob@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should register a new user", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "alice@example.com",
        username: "alice",
        password: "secret",
        displayName: "Alice"
      });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.AuthToken.token).toBeDefined();
    userId = res.body.user.id;
    authToken = res.body.AuthToken.token;
  });

  it("should not register with duplicate email", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "alice@example.com",
        username: "alice2",
        password: "secret",
        displayName: "Alice2"
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should not register with duplicate username", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "alice2@example.com",
        username: "alice",
        password: "secret",
        displayName: "Alice2"
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should login with the new user", async () => {
    const res = await request(API)
      .post("/auth/login")
      .send({
        email: "alice@example.com",
        password: "secret"
      });
    expect(res.status).toBe(200);
    expect(res.body.authToken.token).toBeDefined();
    authToken = res.body.authToken.token;
    userId = res.body.user.userId;
  });

  it("should fail login with wrong password", async () => {
    const res = await request(API)
      .post("/auth/login")
      .send({
        email: "alice@example.com",
        password: "wrong"
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("should fail login with non-existent user", async () => {
    const res = await request(API)
      .post("/auth/login")
      .send({
        email: "idontexist@example.com",
        password: "secret"
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("should get the current user profile", async () => {
    const res = await request(API)
      .get("/auth/me")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("alice@example.com");
  });

  it("should fail to get profile with no token", async () => {
    const res = await request(API)
      .get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("should fail to get profile with invalid token", async () => {
    const res = await request(API)
      .get("/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  // --- USER ---
  it("should get the user by id", async () => {
    const res = await request(API)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.userId).toBe(userId);
  });

  it("should fail to get user with wrong token", async () => {
    const res = await request(API)
      .get(`/users/${userId}`)
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(403); // or 401 depending on your logic
  });

  it("should fail to get user with no token", async () => {
    const res = await request(API)
      .get(`/users/${userId}`);
    expect(res.status).toBe(401);
  });

  it("should update the user", async () => {
    const res = await request(API)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ displayName: "Alice Updated" });
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe("Alice Updated");
  });

  it("should fail to update user with invalid token", async () => {
    const res = await request(API)
      .patch(`/users/${userId}`)
      .set("Authorization", "Bearer invalidtoken")
      .send({ displayName: "Should Not Work" });
    expect(res.status).toBe(403); // or 401
  });

  it("should search for users", async () => {
    const res = await request(API)
      .get(`/users/search?query=alice`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("should fail to search users with no token", async () => {
    const res = await request(API)
      .get(`/users/search?query=alice`);
    expect(res.status).toBe(401);
  });

  // --- PRACTICE LOGS ---
  it("should fail to create a practice log with missing fields", async () => {
    const res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Incomplete" });
    expect(res.status).toBe(400);
  });

  it("should create a practice log", async () => {
    const res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Practice Piano",
        durationMinutes: 60,
        visibility: "public"
      });
    expect(res.status).toBe(201);
    expect(res.body.practiceLog).toBeDefined();
    practiceLogId = res.body.practiceLog.practiceLogId;
  });

  it("should create another practice log", async () => {
    const res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Practice Violin",
        durationMinutes: 30,
        visibility: "private"
      });
    expect(res.status).toBe(201);
    expect(res.body.practiceLog).toBeDefined();
    deletedPracticeLogId = res.body.practiceLog.practiceLogId;
  });

  it("should get the practice log feed", async () => {
    const res = await request(API)
      .get("/practice-logs/feed?pageSize=5")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.practiceLogs)).toBe(true);
    expect(res.body.practiceLogs.length).toBeGreaterThan(0);
  });

  it("should get a practice log by id", async () => {
    const res = await request(API)
      .get(`/practice-logs/${practiceLogId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.practiceLog.practiceLogId).toBe(practiceLogId);
  });

  it("should fail to get practice log with invalid id", async () => {
    const res = await request(API)
      .get(`/practice-logs/invalidid`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it("should update a practice log", async () => {
    const res = await request(API)
      .patch(`/practice-logs/${practiceLogId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ postText: "Updated notes" });
    expect(res.status).toBe(200);
    expect(res.body.practiceLog.postText).toBe("Updated notes");
  });

  it("should fail to update practice log with invalid token", async () => {
    const res = await request(API)
      .patch(`/practice-logs/${practiceLogId}`)
      .set("Authorization", "Bearer invalidtoken")
      .send({ postText: "Should Not Work" });
    expect(res.status).toBe(403); // or 401
  });

  it("should delete a practice log", async () => {
    const res = await request(API)
      .delete(`/practice-logs/${deletedPracticeLogId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(204);
  });

  it("should fail to delete practice log with invalid id", async () => {
    const res = await request(API)
      .delete(`/practice-logs/invalidid`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  // --- SECOND USER FOR EDGE CASES ---
  it("should register a second user", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "bob@example.com",
        username: "bob",
        password: "secret",
        displayName: "Bob"
      });
    expect(res.status).toBe(201);
    secondUserId = res.body.user.userId;
    secondUserToken = res.body.AuthToken.token;
  });

  it("should not allow second user to update first user's practice log", async () => {
    const res = await request(API)
      .patch(`/practice-logs/${practiceLogId}`)
      .set("Authorization", `Bearer ${secondUserToken}`)
      .send({ postText: "Malicious update" });
    expect(res.status).toBe(403);
  });

  it("should not allow second user to delete first user's practice log", async () => {
    const res = await request(API)
      .delete(`/practice-logs/${practiceLogId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);
    expect(res.status).toBe(403);
  });

  it("should not allow second user to update first user's profile", async () => {
    const res = await request(API)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${secondUserToken}`)
      .send({ displayName: "Hacker" });
    expect(res.status).toBe(403);
  });

  it("should not allow second user to delete first user's profile", async () => {
    const res = await request(API)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);
    expect(res.status).toBe(403);
  });

  // --- AUTH LOGOUT ---
  it("should logout the user", async () => {
    const res = await request(API)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(204);
  });

  it("should fail to use token after logout", async () => {
    const res = await request(API)
      .get("/auth/me")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(401);
  });

  // --- USER DELETE ---
  it("should delete the second user", async () => {
    const res = await request(API)
      .delete(`/users/${secondUserId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);
    expect(res.status).toBe(204);
  });

  it("should fail to get deleted user", async () => {
    const res = await request(API)
      .get(`/users/${secondUserId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);
    expect(res.status).toBe(403);
  });

  // --- HEALTH CHECK ---
  it("should return health status", async () => {
    const res = await request(API).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  // --- INVALID ROUTES ---
  it("should 404 on unknown route", async () => {
    const res = await request(API).get("/not-a-real-route");
    expect(res.status).toBe(404);
  });

  it("should 404 on unknown method", async () => {
    const res = await request(API).put("/practice-logs");
    expect(res.status).toBe(404);
  });
});