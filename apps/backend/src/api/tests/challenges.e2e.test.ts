import request from "supertest";

const API = "http://localhost:3001";

describe("CHALLENGES API Integration", () => {
  let adminToken: string, adminId: string, userToken: string, userId: string;
  let challengeId: string;

  beforeAll(async () => {
    // Register admin
    let res = await request(API).post("/auth/register").send({
      email: "admin@example.com",
      username: "adminuser",
      password: "secret",
      displayName: "AdminUser"
    });
    adminToken = res.body.AuthToken.token;
    adminId = res.body.user.userId;

    // Register user
    res = await request(API).post("/auth/register").send({
      email: "challengeuser@example.com",
      username: "challengeuser",
      password: "secret",
      displayName: "ChallengeUser"
    });
    userToken = res.body.AuthToken.token;
    userId = res.body.user.userId;
  });

  it("should allow admin to create a challenge", async () => {
    const res = await request(API)
      .post("/challenges")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Test challenge", task: "Practice 5 days", targetNumber: 5, instrument: "piano" });
    expect(res.status).toBe(201);
    challengeId = res.body.challenge.challengeId;
  });

  it("should list all challenges", async () => {
    const res = await request(API)
      .get("/challenges")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.challenges)).toBe(true);
    expect(res.body.challenges.length).toBeGreaterThan(0);
  });

  it("should fetch a challenge by id", async () => {
    const res = await request(API)
      .get(`/challenges/${challengeId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.challenge.challengeId).toBe(challengeId);
  });

  it("should allow user to mark challenge as complete", async () => {
    const res = await request(API)
      .post(`/challenges/${challengeId}/complete`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
  });

  it("should list completed challenges for user", async () => {
    const res = await request(API)
      .get(`/users/${userId}/completed-challenges`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.completed)).toBe(true);
    expect(res.body.completed.length).toBeGreaterThan(0);
  });

//   it("should not allow non-admin to create a challenge", async () => {
//     const res = await request(API)
//       .post("/challenges")
//       .set("Authorization", `Bearer ${userToken}`)
//       .send({ description: "User challenge", task: "Do something", targetNumber: 1 });
//     expect(res.status).toBe(403);
//   });

  it("should return 404 for non-existent challenge", async () => {
    const res = await request(API)
      .get("/challenges/nonexistent")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 401 for missing token", async () => {
    const res = await request(API)
      .get("/challenges");
    expect(res.status).toBe(401);
  });
});
