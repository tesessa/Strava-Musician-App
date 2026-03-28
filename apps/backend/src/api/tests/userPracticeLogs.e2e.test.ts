import request from "supertest";
import { API, establishFriendship } from "./testHelpers";

describe("GET /users/:userId/practice-logs - Visibility, Auth, Pagination", () => {
  let publicUser: any = {}, privateUser: any = {}, friendUser: any = {};
  let publicToken: string, privateToken: string, friendToken: string;
  let stranger: any = {}, strangerToken: string;
  let friendLogIds: string[] = [], publicLogIds: string[] = [], privateLogIds: string[] = [];

  beforeAll(async () => {
    // Register users
    const users = [
      { email: "public@example.com", username: "publicuser", password: "pw1", displayName: "Public", postVisibility: "public" },
      { email: "private@example.com", username: "privateuser", password: "pw2", displayName: "Private", postVisibility: "private" },
      { email: "friend@example.com", username: "frienduser", password: "pw3", displayName: "Friend", postVisibility: "friends" },
      { email: "stranger@example.com", username: "stranger", password: "pw4", displayName: "Stranger", postVisibility: "public" },
    ];
    for (const u of users) {
      const res = await request(API)
        .post("/auth/register")
        .send(u);
      if (u.username === "publicuser") {
        publicUser = res.body.user;
        publicToken = res.body.token;
      } else if (u.username === "privateuser") {
        privateUser = res.body.user;
        privateToken = res.body.token;
      } else if (u.username === "frienduser") {
        friendUser = res.body.user;
        friendToken = res.body.token;
      } else if (u.username === "stranger") {
        stranger = res.body.user;
        strangerToken = res.body.token;
      }
    }
    // Set visibilities explicitly (in case not set at registration)
    await request(API).patch(`/users/${publicUser.userId}`).set("Authorization", `Bearer ${publicToken}`).send({ postVisibility: "public" });
    await request(API).patch(`/users/${privateUser.userId}`).set("Authorization", `Bearer ${privateToken}`).send({ postVisibility: "private" });
    await request(API).patch(`/users/${friendUser.userId}`).set("Authorization", `Bearer ${friendToken}`).send({ postVisibility: "friends" });

    // Create practice logs for each user
    for (let i = 0; i < 3; i++) {
      let res = await request(API)
        .post("/practice-logs")
        .set("Authorization", `Bearer ${publicToken}`)
        .send({ title: `Public Log ${i+1}`, durationMinutes: 10 + i, postVisibility: "public" });
      publicLogIds.push(res.body.practiceLogId);
      res = await request(API)
        .post("/practice-logs")
        .set("Authorization", `Bearer ${privateToken}`)
        .send({ title: `Private Log ${i+1}`, durationMinutes: 10 + i, postVisibility: "private" });
      privateLogIds.push(res.body.practiceLogId);
      res = await request(API)
        .post("/practice-logs")
        .set("Authorization", `Bearer ${friendToken}`)
        .send({ title: `Friend Log ${i+1}`, durationMinutes: 10 + i, postVisibility: "friends" });
      friendLogIds.push(res.body.practiceLogId);
    }
    await establishFriendship(publicToken, friendToken, friendUser.userId);
  });

  it("should allow self to see all their logs", async () => {
    const res = await request(API)
      .get(`/users/${publicUser.userId}/practice-logs`)
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    // Should be reverse chronological
    expect(res.body[0].createdAt > res.body[1].createdAt).toBe(true);
  });

  it("should allow friend to see friend's logs if postVisibility is 'friends' or 'public'", async () => {
    const res = await request(API)
      .get(`/users/${friendUser.userId}/practice-logs`)
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });

  it("should not allow stranger to see private user's logs", async () => {
    const res = await request(API)
      .get(`/users/${privateUser.userId}/practice-logs`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow stranger to see public user's logs", async () => {
    const res = await request(API)
      .get(`/users/${publicUser.userId}/practice-logs`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });

  it("should paginate logs correctly", async () => {
    // Get first page
    let res = await request(API)
      .get(`/users/${publicUser.userId}/practice-logs?pageSize=2`)
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    const lastId = res.body[1].practiceLogId;
    // Get next page
    res = await request(API)
      .get(`/users/${publicUser.userId}/practice-logs?pageSize=2&lastItemId=${lastId}`)
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    // Should only be 1 left
    expect(res.body.length).toBe(1);
  });

  it("should return forbidden for non-friend on friends-only logs", async () => {
    const res = await request(API)
      .get(`/users/${friendUser.userId}/practice-logs`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should return 401 for missing token", async () => {
    const res = await request(API)
      .get(`/users/${publicUser.userId}/practice-logs`);
    expect(res.status).toBe(401);
  });
});

describe("GET /practice-logs/feed - Feed, Friends, Pagination", () => {
  let publicUser: any = {}, friendUser: any = {}, stranger: any = {};
  let publicToken: string, friendToken: string, strangerToken: string;
  let publicLogIds: string[] = [], friendLogIds: string[] = [];

  beforeAll(async () => {
    // Register users
    const users = [
      { email: "public2@example.com", username: "publicuser2", password: "pw1", displayName: "Public2", postVisibility: "public" },
      { email: "friend2@example.com", username: "frienduser2", password: "pw2", displayName: "Friend2", postVisibility: "public" },
      { email: "stranger2@example.com", username: "stranger2", password: "pw3", displayName: "Stranger2", postVisibility: "public" },
    ];
    for (const u of users) {
      const res = await request(API)
        .post("/auth/register")
        .send(u);
      if (u.username === "publicuser2") {
        publicUser = res.body.user;
        publicToken = res.body.token;
      } else if (u.username === "frienduser2") {
        friendUser = res.body.user;
        friendToken = res.body.token;
      } else if (u.username === "stranger2") {
        stranger = res.body.user;
        strangerToken = res.body.token;
      }
    }
    await establishFriendship(publicToken, friendToken, friendUser.userId);
    // Create practice logs for each
    for (let i = 0; i < 3; i++) {
      let res = await request(API)
        .post("/practice-logs")
        .set("Authorization", `Bearer ${publicToken}`)
        .send({ title: `Public2 Log ${i+1}`, durationMinutes: 10 + i, postVisibility: "public" });
      publicLogIds.push(res.body.practiceLogId);
      res = await request(API)
        .post("/practice-logs")
        .set("Authorization", `Bearer ${friendToken}`)
        .send({ title: `Friend2 Log ${i+1}`, durationMinutes: 10 + i, postVisibility: "public" });
      friendLogIds.push(res.body.practiceLogId);
    }
  });

  it("should show own and friends' logs in feed, reverse chronological", async () => {
    const res = await request(API)
      .get("/practice-logs/feed")
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    // Should include 3 own + 3 friend logs
    expect(res.body.length).toBeGreaterThanOrEqual(6);
    // Should be reverse chronological
    expect(new Date(res.body[0].createdAt).getTime())
      .toBeGreaterThan(new Date(res.body[1].createdAt).getTime());
  });

  it("should paginate feed logs", async () => {
    let res = await request(API)
      .get("/practice-logs/feed?pageSize=2")
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    const lastId = res.body[1].practiceLogId;
    res = await request(API)
      .get(`/practice-logs/feed?pageSize=2&lastItemId=${lastId}`)
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should not show stranger's logs in feed", async () => {
    const res = await request(API)
      .get("/practice-logs/feed")
      .set("Authorization", `Bearer ${publicToken}`);
    expect(res.status).toBe(200);
    const strangerLog = res.body.find(
      (log: any) => log.userId === stranger.userId
    );
    expect(strangerLog).toBeUndefined();
  });
});
