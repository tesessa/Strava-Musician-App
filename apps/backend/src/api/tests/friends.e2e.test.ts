import { use } from "react";
import request from "supertest";

const API = "http://localhost:3001";

describe("Friends API Integration", () => {
  let userToken: string;
  let userId: string;
  let friendToken: string;
  let friendId: string;
  let extraUserTokens: string[] = [];
  let extraUserIds: string[] = [];

  it("should register the main user", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "mainuser@example.com",
        username: "mainuser",
        password: "secret",
        displayName: "Main User"
      });
    expect(res.status).toBe(201);
    userId = res.body.user.userId || res.body.user.id;
    userToken = res.body.authToken.token;
  });

  it("should register a friend user", async () => {
    const res = await request(API)
      .post("/auth/register")
      .send({
        email: "friend@example.com",
        username: "frienduser",
        password: "secret",
        displayName: "Friend User"
      });
    expect(res.status).toBe(201);
    friendId = res.body.user.userId || res.body.user.id;
    friendToken = res.body.authToken.token;
  });

  it("should send a friend request and accept it", async () => {
    // Send request from userId to friendId
    let res = await request(API)
      .post(`/friend-requests/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201); //because it creates a new request

    // Accept as friendId
    const reqId = res.body.requestId || res.body.request?.requestId;
    res = await request(API)
      .post(`/friend-requests/${reqId}/accept`)
      .set("Authorization", `Bearer ${friendToken}`);
    expect(res.status).toBe(200);
  });

  it("should confirm is-friend returns true for both users", async () => {
    let res = await request(API)
      .get(`/friends/is-friend/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isFriend).toBe(true);

    res = await request(API)
      .get(`/friends/is-friend/${userId}`)
      .set("Authorization", `Bearer ${friendToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isFriend).toBe(true);
  });

  it("should return paginated friends list", async () => {
    // First page
    let res = await request(API)
      .get(`/friends?pageSize=1`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    const firstFriend = res.body[0].friendId;

    // Next page (should be empty for only one friend)
    res = await request(API)
      .get(`/friends?lastFriendId=${firstFriend}&pageSize=1`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should remove a friend and is-friend returns false", async () => {
    let res = await request(API)
      .delete(`/friends/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    res = await request(API)
      .get(`/friends/is-friend/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isFriend).toBe(false);
  });

  it("should not allow sending a friend request to self", async () => {
    const res = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });

  it("should not allow duplicate friend requests", async () => {
    // Send request from userId to friendId
    let res = await request(API)
      .post(`/friend-requests/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
    // Send again (should not create duplicate)
    res = await request(API)
      .post(`/friend-requests/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });

  it("should not allow accepting a non-existent friend request", async () => {
    const res = await request(API)
      .post(`/friend-requests/fake-request-id/accept`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should not allow removing a non-friend", async () => {
    const res = await request(API)
      .delete(`/friends/${friendId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should not allow unauthorized access to friends list", async () => {
    const res = await request(API)
      .get("/friends?pageSize=1");
    expect(res.status).toBe(401);
  });

  it("should not allow using an invalid token", async () => {
    const res = await request(API)
      .get("/friends?pageSize=1")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });

  it("should handle pagination with many friends", async () => {
    // Register extra users and friend them (at least 3 for robust pagination)
    for (let i = 0; i < 3; i++) {
      const res = await request(API)
        .post("/auth/register")
        .send({
          email: `extra${i}@example.com`,
          username: `extrauser${i}`,
          password: "secret",
          displayName: `Extra User ${i}`
        });
      expect(res.status).toBe(201);
      const extraId = res.body.user.userId || res.body.user.id;
      const extraToken = res.body.authToken.token;
      extraUserIds.push(extraId);
      extraUserTokens.push(extraToken);
      // Send and accept friend request
      let reqRes = await request(API)
        .post(`/friend-requests/${extraId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(reqRes.status).toBe(201);
      const reqId = reqRes.body.requestId || reqRes.body.request?.requestId;
      expect(reqId).toBeTruthy();
      reqRes = await request(API)
        .post(`/friend-requests/${reqId}/accept`)
        .set("Authorization", `Bearer ${extraToken}`);
      expect(reqRes.status).toBe(200);
    }
      // Paginate through all friends (should be at least 3)
      let lastFriendId = null;
      let total = 0;
      for (let i = 0; i < 5; i++) { // 3 extras + 1 original friend + 1 extra iteration
        let url = "/friends?pageSize=1";
        if (lastFriendId) url += `&lastFriendId=${lastFriendId}`;
        const res = await request(API)
          .get(url)
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length === 0) break;
        total += res.body.length;
        lastFriendId = res.body[0].friendId;
      }
      expect(total).toBeGreaterThanOrEqual(3);
  });

  it("should not allow friend requests to non-existent users", async () => {
    const res = await request(API)
      .post(`/friend-requests/nonexistentuserid`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should list incoming and outgoing friend requests with pagination", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "incomingtest@example.com",
        username: "incomingtest",
        password: "secret",
        displayName: "Incoming Test"
      });
    expect(resNew.status).toBe(201);
    const incomingUserId = resNew.body.user.userId || resNew.body.user.id;
    const incomingToken = resNew.body.authToken.token;
    extraUserIds.push(incomingUserId);
    extraUserTokens.push(incomingToken);

    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${incomingToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;
    expect(requestId).toBeTruthy();

      // List incoming requests for userId
      let res = await request(API)
        .get(`/friend-requests/incoming?pageSize=1`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const firstIncoming = res.body[0];
      // Paginate (should be empty after first if only one)
      res = await request(API)
        .get(`/friend-requests/incoming?lastRequestId=${firstIncoming.requestId}&pageSize=1`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

    // List outgoing requests for incoming user
    res = await request(API)
      .get(`/friend-requests/outgoing?pageSize=1`)
      .set("Authorization", `Bearer ${incomingToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const firstOutgoing = res.body[0];
    // Paginate (should be empty after first if only one)
    res = await request(API)
      .get(`/friend-requests/outgoing?lastRequestId=${firstOutgoing.requestId}&pageSize=1`)
      .set("Authorization", `Bearer ${incomingToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should reject a friend request", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "rejecttest@example.com",
        username: "rejecttest",
        password: "secret",
        displayName: "Reject Test"
      });
    expect(resNew.status).toBe(201);
    const rejectUserId = resNew.body.user.userId || resNew.body.user.id;
    const rejectToken = resNew.body.authToken.token;
    extraUserIds.push(rejectUserId);
    extraUserTokens.push(rejectToken);

    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${rejectToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;

    // Reject the friend request as userId
    let res = await request(API)
      .post(`/friend-requests/${requestId}/reject`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should cancel a sent friend request", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "canceltest@example.com",
        username: "canceltest",
        password: "secret",
        displayName: "Cancel Test"
      });
    expect(resNew.status).toBe(201);
    const cancelUserId = resNew.body.user.userId || resNew.body.user.id;
    const cancelToken = resNew.body.authToken.token;
    extraUserIds.push(cancelUserId);
    extraUserTokens.push(cancelToken);

    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${cancelToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;

    // Cancel the friend request as sender
    let res = await request(API)
      .delete(`/friend-requests/${requestId}`)
      .set("Authorization", `Bearer ${cancelToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return empty array for non-existent lastFriendId in pagination", async () => {
    const res = await request(API)
      .get("/friends?lastFriendId=nonexistentid&pageSize=1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should return empty array for non-existent lastRequestId in incoming pagination", async () => {
    const res = await request(API)
      .get("/friend-requests/incoming?lastRequestId=nonexistentid&pageSize=1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should return empty array for non-existent lastRequestId in outgoing pagination", async () => {
    const res = await request(API)
      .get("/friend-requests/outgoing?lastRequestId=nonexistentid&pageSize=1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should default or error gracefully for invalid pageSize", async () => {
    const res = await request(API)
      .get("/friends?pageSize=notanumber")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not return accepted/rejected/canceled requests in incoming/outgoing lists", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "statusfilter@example.com",
        username: "statusfilter",
        password: "secret",
        displayName: "Status Filter"
      });
    expect(resNew.status).toBe(201);
    const statusUserId = resNew.body.user.userId || resNew.body.user.id;
    const statusToken = resNew.body.authToken.token;
    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${statusToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;
    // Accept the request
    let res = await request(API)
      .post(`/friend-requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    // Now, incoming/outgoing lists should not include this request
    res = await request(API)
      .get("/friend-requests/incoming?pageSize=10")
      .set("Authorization", `Bearer ${userToken}`);
    expect((res.body as any[]).find((r: any) => r.requestId === requestId)).toBeUndefined();
    res = await request(API)
      .get("/friend-requests/outgoing?pageSize=10")
      .set("Authorization", `Bearer ${statusToken}`);
    expect((res.body as any[]).find((r: any) => r.requestId === requestId)).toBeUndefined();
  });

  it("should forbid cancelling a request as a non-sender", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "forbidcancel@example.com",
        username: "forbidcancel",
        password: "secret",
        displayName: "Forbid Cancel"
      });
    expect(resNew.status).toBe(201);
    const forbidUserId = resNew.body.user.userId || resNew.body.user.id;
    const forbidToken = resNew.body.authToken.token;
    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${forbidToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;
    // Try to cancel as userId (not sender)
    let res = await request(API)
      .delete(`/friend-requests/${requestId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should forbid accepting a request as a non-receiver", async () => {
    // Register a new user to send a request to userId
    const resNew = await request(API)
      .post("/auth/register")
      .send({
        email: "forbidaccept@example.com",
        username: "forbidaccept",
        password: "secret",
        displayName: "Forbid Accept"
      });
    expect(resNew.status).toBe(201);
    const forbidUserId = resNew.body.user.userId || resNew.body.user.id;
    const forbidToken = resNew.body.authToken.token;
    // Send a friend request to userId
    let reqRes = await request(API)
      .post(`/friend-requests/${userId}`)
      .set("Authorization", `Bearer ${forbidToken}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.requestId || reqRes.body.request?.requestId;
    // Try to accept as sender (not receiver)
    let res = await request(API)
      .post(`/friend-requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${forbidToken}`);
    expect(res.status).toBe(403);
  });

  it("should not create duplicate friendships if requests cross", async () => {
    // Register two new users
    const resA = await request(API)
      .post("/auth/register")
      .send({
        email: "crossa@example.com",
        username: "crossa",
        password: "secret",
        displayName: "Cross A"
      });
    const resB = await request(API)
      .post("/auth/register")
      .send({
        email: "crossb@example.com",
        username: "crossb",
        password: "secret",
        displayName: "Cross B"
      });
    const tokenA = resA.body.authToken.token;
    const idA = resA.body.user.userId || resA.body.user.id;
    const tokenB = resB.body.authToken.token;
    const idB = resB.body.user.userId || resB.body.user.id;
    // A sends to B, B sends to A
    let reqA = await request(API)
      .post(`/friend-requests/${idB}`)
      .set("Authorization", `Bearer ${tokenA}`);
    let reqB = await request(API)
      .post(`/friend-requests/${idA}`)
      .set("Authorization", `Bearer ${tokenB}`);
    // Accept both
    let accA = await request(API)
      .post(`/friend-requests/${reqA.body.requestId}/accept`)
      .set("Authorization", `Bearer ${tokenB}`);
    let accB = await request(API)
      .post(`/friend-requests/${reqB.body.requestId}/accept`)
      .set("Authorization", `Bearer ${tokenA}`);
    // Both should be friends
    let isFriendA = await request(API)
      .get(`/friends/is-friend/${idB}`)
      .set("Authorization", `Bearer ${tokenA}`);
    let isFriendB = await request(API)
      .get(`/friends/is-friend/${idA}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(isFriendA.body.isFriend).toBe(true);
    expect(isFriendB.body.isFriend).toBe(true);
  });
});
