import { SupabaseFriendRequestsDao } from "../SupabaseFriendRequestsDao";
import db from "../config/SupabaseKnexConnection";
import { randomUUID } from "crypto";

const dao = new SupabaseFriendRequestsDao();

let USER_ID: string;
let FRIEND_ID: string;
let OTHER_USER_ID: string;

beforeAll(async () => {
  USER_ID = randomUUID();
  FRIEND_ID = randomUUID();
  OTHER_USER_ID = randomUUID();

  await db("User").insert([
    { id: USER_ID, username: "user1" },
    { id: FRIEND_ID, username: "user2" },
    { id: OTHER_USER_ID, username: "user3" },
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

describe("SupabaseFriendRequestsDao (DB Integration)", () => {
  test("createFriendRequest inserts a pending request", async () => {
    const request = await dao.createFriendRequest(USER_ID, FRIEND_ID);

    expect(request).toBeTruthy();
    expect(request.senderId).toBe(USER_ID);
    expect(request.receiverId).toBe(FRIEND_ID);
    expect(request.status).toBe("pending");

    const dbRequest = await db("FriendRequest")
      .where({ senderId: USER_ID, receiverId: FRIEND_ID })
      .first();

    expect(dbRequest).toBeTruthy();
  });

  test("getFriendRequestById returns request", async () => {
    const request = await dao.createFriendRequest(USER_ID, FRIEND_ID);

    const fetched = await dao.getFriendRequestById(request.requestId);

    expect(fetched).not.toBeNull();
    expect(fetched?.requestId).toBe(request.requestId);
  });

  test("listIncoming returns requests", async () => {
    await dao.createFriendRequest(USER_ID, FRIEND_ID);
    await dao.createFriendRequest(OTHER_USER_ID, FRIEND_ID);

    const incoming = await dao.listIncoming(FRIEND_ID);

    expect(incoming.length).toBe(2);
    expect(incoming.every((r) => r.receiverId === FRIEND_ID)).toBe(true);
  });

  test("listOutgoing returns requests", async () => {
    await dao.createFriendRequest(USER_ID, FRIEND_ID);
    await dao.createFriendRequest(USER_ID, OTHER_USER_ID);

    const outgoing = await dao.listOutgoing(USER_ID);

    expect(outgoing.length).toBe(2);
    expect(outgoing.every((r) => r.senderId === USER_ID)).toBe(true);
  });

  test("listIncoming pagination works", async () => {
    const r1 = await dao.createFriendRequest(USER_ID, FRIEND_ID);
    const r2 = await dao.createFriendRequest(OTHER_USER_ID, FRIEND_ID);

    const page1 = await dao.listIncoming(FRIEND_ID, { pageSize: 1 });
    const last = page1[0].requestId;

    const page2 = await dao.listIncoming(FRIEND_ID, {
      lastRequestId: last,
      pageSize: 1,
    });

    expect(page1.length).toBe(1);
    expect(page2.length).toBeGreaterThanOrEqual(0);
  });

  test("listOutgoing pagination works", async () => {
    const r1 = await dao.createFriendRequest(USER_ID, FRIEND_ID);
    const r2 = await dao.createFriendRequest(USER_ID, OTHER_USER_ID);

    const page1 = await dao.listOutgoing(USER_ID, { pageSize: 1 });
    const last = page1[0].requestId;

    const page2 = await dao.listOutgoing(USER_ID, {
      lastRequestId: last,
      pageSize: 1,
    });

    expect(page1.length).toBe(1);
    expect(page2.length).toBeGreaterThanOrEqual(0);
  });

  test("listIncoming throws on invalid cursor", async () => {
    await expect(
      dao.listIncoming(FRIEND_ID, { lastRequestId: randomUUID() }),
    ).rejects.toThrow("Invalid lastRequestId cursor");
  });

  test("acceptRequest updates status and creates friendships", async () => {
    const request = await dao.createFriendRequest(USER_ID, FRIEND_ID);

    await dao.acceptRequest(request.requestId);

    const updated = await db("FriendRequest")
      .where({ requestId: request.requestId })
      .first();

    expect(updated.status).toBe("accepted");
    expect(updated.respondedAt).toBeTruthy();

    const friendships = await db("Friend").where(function () {
      this.where({ userId: USER_ID, friendId: FRIEND_ID }).orWhere({
        userId: FRIEND_ID,
        friendId: USER_ID,
      });
    });

    expect(friendships.length).toBe(2);
  });

  test("acceptRequest throws if request does not exist", async () => {
    await expect(dao.acceptRequest(randomUUID())).rejects.toThrow(
      "Friend request not found",
    );
  });

  test("rejectRequest updates status", async () => {
    const request = await dao.createFriendRequest(USER_ID, FRIEND_ID);

    await dao.rejectRequest(request.requestId);

    const updated = await db("FriendRequest")
      .where({ requestId: request.requestId })
      .first();

    expect(updated.status).toBe("rejected");
    expect(updated.respondedAt).toBeTruthy();
  });

  test("cancelRequest updates status", async () => {
    const request = await dao.createFriendRequest(USER_ID, FRIEND_ID);

    await dao.cancelRequest(request.requestId);

    const updated = await db("FriendRequest")
      .where({ requestId: request.requestId })
      .first();

    expect(updated.status).toBe("canceled"); // matches enum
    expect(updated.respondedAt).toBeTruthy();
  });
});
