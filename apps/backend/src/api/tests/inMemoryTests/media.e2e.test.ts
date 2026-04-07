import request from "supertest";

const API = "http://localhost:3001";

describe("MEDIA API Integration", () => {
  let userToken: string, userId: string, friendToken: string, friendId: string, strangerToken: string;
  let practiceLogId: string, friendPracticeLogId: string, mediaId: string;

  beforeAll(async () => {
    // Register users
    let res = await request(API).post("/auth/register").send({
      email: "mediauser@example.com",
      username: "mediauser",
      password: "secret",
      displayName: "MediaUser",
      postVisibility: "public"
    });
    userToken = res.body.authToken.token;
    userId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "mediafriend@example.com",
      username: "mediafriend",
      password: "secret",
      displayName: "MediaFriend",
      postVisibility: "friends"
    });
    friendToken = res.body.authToken.token;
    friendId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "mediastranger@example.com",
      username: "mediastranger",
      password: "secret",
      displayName: "MediaStranger",
      postVisibility: "public"
    });
    strangerToken = res.body.authToken.token;

    // Make user and friend friends
    await request(API).post(`/friends/${friendId}`).set("Authorization", `Bearer ${userToken}`);
    await request(API).post(`/friends/${userId}`).set("Authorization", `Bearer ${friendToken}`);

    // Create practice logs
    res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "User Log", durationMinutes: 10, visibility: "public" });
    practiceLogId = res.body.practiceLog.practiceLogId;

    res = await request(API)
      .post("/practice-logs")
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ title: "Friend Log", durationMinutes: 10, visibility: "friends" });
    friendPracticeLogId = res.body.practiceLog.practiceLogId;
  });

  it("should allow owner to POST media", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/media`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ type: "image", url: "http://example.com/img.png" });
    expect(res.status).toBe(201);
    expect(res.body.media).toBeDefined();
    mediaId = res.body.media.mediaId;
  });

  it("should not allow non-owner to POST media", async () => {
    const res = await request(API)
      .post(`/practice-logs/${practiceLogId}/media`)
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ type: "image", url: "http://example.com/img2.png" });
    expect(res.status).toBe(403);
  });

  it("should allow owner to GET media", async () => {
    const res = await request(API)
      .get(`/practice-logs/${practiceLogId}/media`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.media)).toBe(true);
    expect(res.body.media.length).toBe(1);
  });

  it("should allow friend to GET friend's media if visibility is 'friends'", async () => {
    // Add media to friend's log
    await request(API)
      .post(`/practice-logs/${friendPracticeLogId}/media`)
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ type: "audio", url: "http://example.com/audio.mp3" });
    const res = await request(API)
      .get(`/practice-logs/${friendPracticeLogId}/media`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.media)).toBe(true);
    expect(res.body.media.length).toBe(1);
  });

  it("should allow stranger to GET public media but not friends-only", async () => {
    // Public log
    let res = await request(API)
      .get(`/practice-logs/${practiceLogId}/media`)
      .set("Authorization", `Bearer ${strangerToken}`);
    console.log("Stranger GET public media status:", res.status);
    expect(res.status).toBe(200);
    // Friends-only log
    res = await request(API)
      .get(`/practice-logs/${friendPracticeLogId}/media`)
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow owner to DELETE media", async () => {
    const res = await request(API)
      .delete(`/media/${mediaId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });

  it("should not allow non-owner to DELETE media", async () => {
    // Add new media
    const res1 = await request(API)
      .post(`/practice-logs/${practiceLogId}/media`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ type: "image", url: "http://example.com/img3.png" });
    const newMediaId = res1.body.media.mediaId;
    const res2 = await request(API)
      .delete(`/media/${newMediaId}`)
      .set("Authorization", `Bearer ${friendToken}`);
    expect(res2.status).toBe(403);
  });
});
