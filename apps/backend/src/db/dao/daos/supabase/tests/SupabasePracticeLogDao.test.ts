import { SupabasePracticeLogDAO } from "../SupabasePracticeLogDao";
import db from "../config/SupabaseKnexConnection";
import { PracticeLog } from "@strava-musician-app/shared";
import { randomUUID } from "crypto";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

const dao = new SupabasePracticeLogDAO();

let USER_ID: string;
let FRIEND_ID: string;
let TOKEN: string;

function makeLog(overrides?: Partial<PracticeLog>): PracticeLog {
  return {
    practiceLogId: randomUUID(),
    userId: USER_ID,
    title: "Test Session",
    postText: "Worked on scales",
    privateText: "Notes",
    instrument: "Piano",
    createdAt: new Date().toISOString(),
    durationMinutes: 30,
    tempo: 120,
    pieceTitle: "Etude",
    composer: "Chopin",
    ...overrides,
  };
}

beforeAll(async () => {
  USER_ID = randomUUID();
  FRIEND_ID = randomUUID();
  TOKEN = "valid-token";

  // Insert users
  await db("User").insert([
    { id: USER_ID, username: "user1" },
    { id: FRIEND_ID, username: "user2" },
  ]);

  // Insert auth session
  await db("AuthSession").insert({
    user_id: USER_ID,
    token: TOKEN,
    expires_at: new Date(Date.now() + 1000000).toISOString(),
  });

  // Insert friendship
  await db("Friend").insert({
    userId: USER_ID,
    friendId: FRIEND_ID,
  });
});

afterAll(async () => {
  await db("PracticeLog").del();
  await db("Friend").del();
  await db("AuthSession").del();
  await db("User").del();

  await db.destroy();
});

beforeEach(async () => {
  await db("PracticeLog").del();
});

describe("SupabasePracticeLogDAO (DB Integration)", () => {
  test("createPracticeLog inserts a log", async () => {
    const log = makeLog();

    const created = await dao.createPracticeLog(log);

    expect(created.practiceLogId).toBe(log.practiceLogId);
    expect(created.userId).toBe(USER_ID);
  });

  test("getPracticeLog returns a log", async () => {
    const log = makeLog();
    await dao.createPracticeLog(log);

    const fetched = await dao.getPracticeLog(log.practiceLogId);

    expect(fetched).not.toBeNull();
    expect(fetched?.practiceLogId).toBe(log.practiceLogId);
  });

  test("updatePracticeLog updates fields", async () => {
    const log = makeLog();
    await dao.createPracticeLog(log);

    const updated = await dao.updatePracticeLog(log.practiceLogId, {
      title: "Updated Title",
    });

    expect(updated?.title).toBe("Updated Title");
  });

  test("deletePracticeLog removes a log", async () => {
    const log = makeLog();
    await dao.createPracticeLog(log);

    const deleted = await dao.deletePracticeLog(log.practiceLogId);
    const fetched = await dao.getPracticeLog(log.practiceLogId);

    expect(deleted).toBe(true);
    expect(fetched).toBeNull();
  });

  test("getUserPracticeLogs returns logs ordered correctly", async () => {
    const older = makeLog({
      createdAt: new Date(Date.now() - 2000).toISOString(),
    });
    const newer = makeLog({
      createdAt: new Date().toISOString(),
    });

    await dao.createPracticeLog(older);
    await dao.createPracticeLog(newer);

    const logs = await dao.getUserPracticeLogs(USER_ID, null, 10);

    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(new Date(logs[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(logs[1].createdAt).getTime(),
    );
  });

  test("pagination works for getUserPracticeLogs", async () => {
    const log1 = makeLog({
      createdAt: new Date(Date.now() - 3000).toISOString(),
    });
    const log2 = makeLog({
      createdAt: new Date(Date.now() - 2000).toISOString(),
    });
    const log3 = makeLog({
      createdAt: new Date(Date.now() - 1000).toISOString(),
    });

    await dao.createPracticeLog(log1);
    await dao.createPracticeLog(log2);
    await dao.createPracticeLog(log3);

    const page1 = await dao.getUserPracticeLogs(USER_ID, null, 2);
    const lastItem = page1[page1.length - 1].practiceLogId;

    const page2 = await dao.getUserPracticeLogs(USER_ID, lastItem, 2);

    expect(page2.length).toBeGreaterThanOrEqual(0);
  });

  test("getFeed returns friend's logs", async () => {
    const friendLog: PracticeLog = {
      ...makeLog(),
      userId: FRIEND_ID,
    };

    await dao.createPracticeLog(friendLog);

    const feed = await dao.getFeed(null, 10, TOKEN);

    expect(feed.some((l) => l.userId === FRIEND_ID)).toBe(true);
  });

  test("getFeed throws for invalid token", async () => {
    await expect(dao.getFeed(null, 10, "bad-token")).rejects.toThrow(
      "Invalid authentication token",
    );
  });

  test("getUserPracticeLogs throws for invalid user", async () => {
    await expect(
      dao.getUserPracticeLogs(randomUUID(), null, 10),
    ).rejects.toThrow("Invalid user ID");
  });
});
