import request from "supertest";

const API = "http://localhost:3001";

describe("LIKES API Integration", () => {
  let userToken: string, userId: string, friendToken: string, friendId: string, strangerToken: string;
  let practiceLogId: string, friendPracticeLogId: string;

  beforeAll(async () => {
    // Register users
    let res = await request(API).post("/auth/register").send({
      email: "likeuser@example.com",
      username: "likeuser",
      password: "secret",
      displayName: "LikeUser"
    });
    userToken = res.body.authToken.token;
    userId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "likefriend@example.com",
      username: "likefriend",
      password: "secret",
      displayName: "LikeFriend"
    });
    friendToken = res.body.authToken.token;
    friendId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "likestranger@example.com",
      username: "likestranger",
      password: "secret",
      displayName: "LikeStranger"
    });
    strangerToken = res.body.authToken.token;

    // Set postVisibility on user profiles
    await request(API).patch(`/users/${userId}`).set("Authorization", `Bearer ${userToken}`).send({ postVisibility: "public" });
    await request(API).patch(`/users/${friendId}`).set("Authorization", `Bearer ${friendToken}`).send({ postVisibility: "friends" });
    // Stranger remains public (default)

    // Make user and friend friends
    await request(API).post(`/friends/${friendId}`).set("Authorization", `Bearer ${userToken}`);
    await request(API).post(`/friends/${userId}`).set("Authorization", `Bearer ${friendToken}`);

    // Create practice logs (no visibility field)
    res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "User Log", durationMinutes: 10 });
    practiceLogId = res.body.practiceLog.practiceLogId;

    res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ title: "Friend Log", durationMinutes: 10 });
    friendPracticeLogId = res.body.practiceLog.practiceLogId;
  });

  it("should allow user to like a practice log", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
  });

  it("should not allow user to like the same log twice", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("already_liked");
  });

  it("should allow friend to like a friend's log if they have access", async () => {
    const res = await request(API)
      .post(`/practice-logs/${friendPracticeLogId}/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
  });

  it("should not allow stranger to like a friends-only log", async () => {
    const res = await request(API)
      .post(`/practice-logs/${friendPracticeLogId}/likes`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow user to get likes for a public log", async () => {
    const res = await request(API)
      .get(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.likes)).toBe(true);
    expect(res.body.likes.length).toBeGreaterThan(0);
  });

  it("should not allow stranger to get likes for a friends-only log", async () => {
    const res = await request(API)
      .get(`/practice-logs/${friendPracticeLogId}/likes`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow user to unlike a log they liked", async () => {
    const res = await request(API)
      .delete(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    console.log(res.body);
    expect(res.status).toBe(204);
  });

  it("should not allow user to unlike a log they haven't liked", async () => {
    const res = await request(API)
      .delete(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`);
    expect(res.status).toBe(403);
  });

  it("should return 404 when liking a non-existent log", async () => {
    const res = await request(API)
      .post(`/practice-logs/nonexistent/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 404 when unliking a non-existent log", async () => {
    const res = await request(API)
      .delete(`/practice-logs/nonexistent/likes`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 401 for missing token", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`);
    expect(res.status).toBe(401);
  });
});
