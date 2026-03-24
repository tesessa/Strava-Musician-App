import request from "supertest";

const API = "http://localhost:3001";

describe("NOTIFICATIONS API Integration", () => {
  let userToken: string, userId: string, friendToken: string, friendId: string, strangerToken: string, strangerId: string;
  let practiceLogId: string, friendPracticeLogId: string, challengeId: string, friendRequestId: string;

  beforeAll(async () => {
    // Register users
    let res = await request(API).post("/auth/register").send({
      email: "notifuser@example.com",
      username: "notifuser",
      password: "secret",
      displayName: "NotifUser"
    });
    userToken = res.body.authToken.token;
    userId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "notiffriend@example.com",
      username: "notiffriend",
      password: "secret",
      displayName: "NotifFriend"
    });
    friendToken = res.body.authToken.token;
    friendId = res.body.user.userId;

    res = await request(API).post("/auth/register").send({
      email: "notifstranger@example.com",
      username: "notifstranger",
      password: "secret",
      displayName: "NotifStranger"
    });
    strangerToken = res.body.authToken.token;
    strangerId = res.body.user.userId;

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

    // Create a challenge as admin
    res = await request(API)
      .post("/auth/register")
      .send({ email: "adminnotif@example.com", username: "adminnotif", password: "secret", displayName: "AdminNotif" });
    const adminToken = res.body.authToken.token;
    res = await request(API)
      .post("/challenges")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Notif challenge", task: "Practice 1 day", targetNumber: 1, instrument: "piano" });
    challengeId = res.body.challenge.challengeId;
  });

  it("should create a notification when a log is liked", async () => {
    await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(201);
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.notifications.some((n: any) => n.type === "like" && n.entityId === practiceLogId)).toBe(true);
  });

  it("should create a notification when a log is commented on", async () => {
    await request(API)
      .post(`/practice-logs/${practiceLogId}/comments`)
      .set("Authorization", `Bearer ${friendToken}`)
      .send({ text: "Nice log!" })
      .expect(201);
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.body.notifications.some((n: any) => n.type === "comment" && n.entityId === practiceLogId)).toBe(true);
  });

  it("should create a notification when a friend request is sent", async () => {
    const res = await request(API)
      .post(`/friend-requests/${strangerId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201);
    friendRequestId = res.body.requestId;
    const notifRes = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(notifRes.body.notifications.some((n: any) => n.type === "friendRequest" && n.entityId === friendRequestId)).toBe(true);
  });

  it("should create a notification when a challenge is completed", async () => {
    await request(API)
      .post(`/challenges/${challengeId}/complete`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.body.notifications.some((n: any) => n.type === "challengeCompleted" && n.entityId === challengeId)).toBe(true);
  });

  it("should only allow the owner to mark a notification as read", async () => {
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications.find((n: any) => !n.isRead);
    expect(notification).toBeTruthy();
    // Mark as read as owner
    await request(API)
      .patch(`/notifications/${notification.notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    // Try as non-owner
    await request(API)
      .patch(`/notifications/${notification.notificationId}/read`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(404);
  });

  it("should only allow the owner to delete a notification", async () => {
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications[0];
    // Delete as owner
    await request(API)
      .delete(`/notifications/${notification.notificationId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    // Try as non-owner
    await request(API)
      .delete(`/notifications/${notification.notificationId}`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(404);
  });

  it("should not allow unauthenticated access to notifications", async () => {
    await request(API)
      .get("/notifications")
      .expect(401);
  });

  it("should return an empty array if no notifications exist", async () => {
    // Register a new user
    const res = await request(API).post("/auth/register").send({
      email: "emptyuser@example.com",
      username: "emptyuser",
      password: "secret",
      displayName: "EmptyUser"
    });
    const emptyToken = res.body.authToken.token;
    const notifRes = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${emptyToken}`);
    expect(Array.isArray(notifRes.body.notifications)).toBe(true);
    expect(notifRes.body.notifications.length).toBe(0);
  });

  it("should not allow listing notifications with an invalid token", async () => {
    await request(API)
      .get("/notifications")
      .set("Authorization", "Bearer invalidtoken")
      .expect(401);
  });

  it("should not allow marking as read with an invalid notificationId", async () => {
    await request(API)
      .patch(`/notifications/invalidid/read`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);
  });

  it("should not allow deleting with an invalid notificationId", async () => {
    await request(API)
      .delete(`/notifications/invalidid`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);
  });

  it("should not allow marking as read without a token", async () => {
    // Use a valid notificationId
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications.find((n: any) => !n.isRead);
    if (notification) {
      await request(API)
        .patch(`/notifications/${notification.notificationId}/read`)
        .expect(401);
    }
  });

  it("should not allow deleting without a token", async () => {
    // Use a valid notificationId
    const res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications[0];
    if (notification) {
      await request(API)
        .delete(`/notifications/${notification.notificationId}`)
        .expect(401);
    }
  });

  it("should not allow listing notifications for another user (token mismatch)", async () => {
    // friendToken should not see userToken's notifications
    const userRes = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const friendRes = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${friendToken}`);
    // Should not see the same notifications
    expect(friendRes.body.notifications.some((n: any) => userRes.body.notifications.map((u: any) => u.notificationId).includes(n.notificationId))).toBe(false);
  });

  it("should not see deleted notifications in the list", async () => {
    //unlike a log before liking it again to create a new notification
    await request(API)
      .delete(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(204);
    // Create a notification by liking a log
    await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(201);
    let res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications.find((n: any) => n.type === "like" && n.entityId === practiceLogId);
    expect(notification).toBeTruthy();
    // Delete it
    await request(API)
      .delete(`/notifications/${notification.notificationId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    // Should not appear in the list anymore
    res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.body.notifications.some((n: any) => n.notificationId === notification.notificationId)).toBe(false);
  });

  it("should allow marking as read on an already read notification (idempotent)", async () => {
    //unlike a log before liking it again to create a new notification
    await request(API)
      .delete(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(204);
    // Create a notification by liking a log
    await request(API)
      .post(`/practice-logs/${practiceLogId}/likes`)
      .set("Authorization", `Bearer ${friendToken}`)
      .expect(201);
    let res = await request(API)
      .get("/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    const notification = res.body.notifications.find((n: any) => n.type === "like" && n.entityId === practiceLogId);
    expect(notification).toBeTruthy();
    // Mark as read
    await request(API)
      .patch(`/notifications/${notification.notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    // Mark as read again (should still succeed)
    await request(API)
      .patch(`/notifications/${notification.notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
  });
});
