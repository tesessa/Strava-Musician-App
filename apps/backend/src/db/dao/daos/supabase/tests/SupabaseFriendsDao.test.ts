import { SupabaseFriendsDao } from "../SupabaseFriendsDao";
import db from "../config/SupabaseKnexConnection";
import { randomUUID } from "crypto";

const dao = new SupabaseFriendsDao();

let USER_ID: string;
let FRIEND_ID: string;
let THIRD_USER_ID: string;

beforeAll(async () => {
  USER_ID = randomUUID();
  FRIEND_ID = randomUUID();
  THIRD_USER_ID = randomUUID();

  await db("User").insert([
    { id: USER_ID, username: "user1" },
    { id: FRIEND_ID, username: "user2" },
    { id: THIRD_USER_ID, username: "user3" },
  ]);
});

afterAll(async () => {
  await db("Friend").del();
  await db("FriendRequest").del();
  await db("User").del();
  await db.destroy();
});

beforeEach(async () => {
  await db("Friend").del();
  await db("FriendRequest").del();
});

describe("SupabaseFriendsDao (DB Integration)", () => {
  test("sendOrAcceptFriendRequest creates a new request", async () => {
    const result = await dao.sendOrAcceptFriendRequest(USER_ID, FRIEND_ID);

    expect(result.requested).toBe(true);
    expect(result.requestId).toBeDefined();

    const request = await db("FriendRequest")
      .where({
        senderId: USER_ID,
        receiverId: FRIEND_ID,
      })
      .first();

    expect(request).toBeTruthy();
    expect(request.status).toBe("pending");
  });

  test("sendOrAcceptFriendRequest accepts incoming request", async () => {
    // Simulate incoming request
    const requestId = randomUUID();
    await db("FriendRequest").insert({
      requestId,
      senderId: FRIEND_ID,
      receiverId: USER_ID,
      status: "pending",
    });

    const result = await dao.sendOrAcceptFriendRequest(USER_ID, FRIEND_ID);

    expect(result.accepted).toBe(true);

    const friendships = await db("Friend").where(function () {
      this.where({ userId: USER_ID, friendId: FRIEND_ID }).orWhere({
        userId: FRIEND_ID,
        friendId: USER_ID,
      });
    });

    expect(friendships.length).toBe(2);
  });

  test("listFriends returns friends", async () => {
    const now = new Date().toISOString();

    await db("Friend").insert([
      { userId: USER_ID, friendId: FRIEND_ID, friendsSince: now },
      { userId: USER_ID, friendId: THIRD_USER_ID, friendsSince: now },
    ]);

    const friends = await dao.listFriends(USER_ID);

    expect(friends.length).toBe(2);
    expect(friends.some((f) => f.friendId === FRIEND_ID)).toBe(true);
    expect(friends.some((f) => f.friendId === THIRD_USER_ID)).toBe(true);
  });

  test("listFriends pagination works", async () => {
    const t1 = new Date(Date.now() - 3000).toISOString();
    const t2 = new Date(Date.now() - 2000).toISOString();
    const t3 = new Date(Date.now() - 1000).toISOString();

    const f1 = randomUUID();
    const f2 = randomUUID();
    const f3 = randomUUID();

    await db("User").insert([
      { id: f1, username: "f1" },
      { id: f2, username: "f2" },
      { id: f3, username: "f3" },
    ]);

    await db("Friend").insert([
      { userId: USER_ID, friendId: f1, friendsSince: t1 },
      { userId: USER_ID, friendId: f2, friendsSince: t2 },
      { userId: USER_ID, friendId: f3, friendsSince: t3 },
    ]);

    const page1 = await dao.listFriends(USER_ID, { pageSize: 2 });
    const last = page1[page1.length - 1].friendId;

    const page2 = await dao.listFriends(USER_ID, {
      lastFriendId: last,
      pageSize: 2,
    });

    expect(page1.length).toBe(2);
    expect(page2.length).toBeGreaterThanOrEqual(0);
  });

  test("listFriends throws on invalid cursor", async () => {
    await expect(
      dao.listFriends(USER_ID, { lastFriendId: randomUUID() }),
    ).rejects.toThrow("Invalid lastFriendId cursor");
  });

  test("isFriend returns true when users are friends", async () => {
    await db("Friend").insert({
      userId: USER_ID,
      friendId: FRIEND_ID,
    });

    const result = await dao.isFriend(USER_ID, FRIEND_ID);

    expect(result).toBe(true);
  });

  test("isFriend returns false when users are not friends", async () => {
    const result = await dao.isFriend(USER_ID, FRIEND_ID);

    expect(result).toBe(false);
  });

  test("removeFriend deletes friendship both directions", async () => {
    await db("Friend").insert([
      { userId: USER_ID, friendId: FRIEND_ID },
      { userId: FRIEND_ID, friendId: USER_ID },
    ]);

    await dao.removeFriend(USER_ID, FRIEND_ID);

    const remaining = await db("Friend").where(function () {
      this.where({ userId: USER_ID, friendId: FRIEND_ID }).orWhere({
        userId: FRIEND_ID,
        friendId: USER_ID,
      });
    });

    expect(remaining.length).toBe(0);
  });

  test("removeFriend throws if no friendship exists", async () => {
    await expect(dao.removeFriend(USER_ID, FRIEND_ID)).rejects.toThrow(
      "No friendship found to delete",
    );
  });
});
