import request from "supertest";

const API = "http://localhost:3001";

describe("COMMENTS API Integration", () => {
  let userToken: string, userId: string, friendToken: string, friendId: string, strangerToken: string;
  let practiceLogId: string, friendPracticeLogId: string;
  let commentId: string, friendCommentId: string;

  beforeAll(async () => {
    // Register users
    let res = await request(API).post("/auth/register").send({
      email: "commentuser@example.com",
      username: "commentuser",
      password: "secret",
      displayName: "CommentUser"
    });
    userToken = res.body.AuthToken.token;
    userId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "commentfriend@example.com",
      username: "commentfriend",
      password: "secret",
      displayName: "CommentFriend"
    });
    friendToken = res.body.AuthToken.token;
    friendId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "commentstranger@example.com",
      username: "commentstranger",
      password: "secret",
      displayName: "CommentStranger"
    });
    strangerToken = res.body.AuthToken.token;

    // Set postVisibility on user profiles
    await request(API).patch(`/users/${userId}`).set("Authorization", `Bearer ${userToken}`).send({ postVisibility: "public" });
    await request(API).patch(`/users/${friendId}`).set("Authorization", `Bearer ${friendToken}`).send({ postVisibility: "friends" });
    // Stranger remains public (default)

    // Make user and friend friends
    await request(API).post(`/friends/${friendId}`).set("Authorization", `Bearer ${userToken}`);
    await request(API).post(`/friends/${userId}`).set("Authorization", `Bearer ${friendToken}`);

    // Create practice logs
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

  it("should allow user to comment on their own log", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/comments`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ text: "My comment" });
    expect(res.status).toBe(201);
    expect(res.body.comment).toBeDefined();
    commentId = res.body.comment.commentId;
  });

  it("should allow friend to comment on friend's log if they have access", async () => {
    const res = await request(API)
      .post(`/practice-logs/${friendPracticeLogId}/comments`)
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ text: "Friend's comment" });
    expect(res.status).toBe(201);
    expect(res.body.comment).toBeDefined();
    friendCommentId = res.body.comment.commentId;
  });

  it("should not allow stranger to comment on friends-only log", async () => {
    const res = await request(API)
      .post(`/practice-logs/${friendPracticeLogId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ text: "Stranger's comment" });
    expect(res.status).toBe(403);
  });

  it("should not allow comment with missing text", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/comments`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("should allow user to get comments for a public log", async () => {
    const res = await request(API)
      .get(`/practice-logs/${practiceLogId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThan(0);
  });

  it("should not allow stranger to get comments for a friends-only log", async () => {
    const res = await request(API)
      .get(`/practice-logs/${friendPracticeLogId}/comments`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow user to delete their own comment", async () => {
    const res = await request(API)
      .delete(`/comments/${commentId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });

  it("should not allow user to delete someone else's comment", async () => {
    const res = await request(API)
      .delete(`/comments/${friendCommentId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should return 403 when commenting on a non-existent log", async () => {
    const res = await request(API)
      .post(`/practice-logs/nonexistent/comments`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ text: "No log" });
    expect(res.status).toBe(403);
  });

  it("should return 404 when deleting a non-existent comment", async () => {
    const res = await request(API)
      .delete(`/comments/nonexistent`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 401 for missing token", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/comments`)
      .send({ text: "No token" });
    expect(res.status).toBe(401);
  });
});
