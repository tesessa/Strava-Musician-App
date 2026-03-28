import { FakeDataHelper } from "../../../src/model/network/FakeDataHelper";

describe("FakeDataHelper", () => {
  test("returns seeded authenticated user", () => {
    const helper = new FakeDataHelper();
    const me = helper.getMe();

    expect(me.userId).toBe("demo-user-1");
    expect(me.username).toBe("demomusician");
  });

  test("supports register/login/logout auth flow", () => {
    const helper = new FakeDataHelper();
    const registered = helper.register({
      email: "newperson@example.com",
      username: "newperson",
      password: "pw123",
    });

    expect(registered.token).toContain("fake-token");
    expect(registered.user?.postVisibility).toBe("friends");

    helper.logout();
    expect(() => helper.getMe()).toThrow("Not authenticated.");

    const login = helper.login({
      email: "newperson@example.com",
      password: "pw123",
    });
    expect(login.user?.username).toBe("newperson");
  });

  test("returns visibility-aware feed and paginates by lastItemId", () => {
    const helper = new FakeDataHelper();

    const firstPage = helper.getPracticeLogsFeed({ pageSize: 1 });
    expect(firstPage).toHaveLength(1);
    expect(firstPage[0].practiceLogId).toBe("practiceLog-101");

    const secondPage = helper.getPracticeLogsFeed({
      pageSize: 2,
      lastItemId: firstPage[0].practiceLogId,
    });

    // demo-user-1 can see own + friend/public logs, but not private logs.
    const ids = secondPage.map((p) => p.practiceLogId);
    expect(ids).toContain("practiceLog-102");
    expect(ids).not.toContain("practiceLog-103");
  });

  test("accepting friend request creates friendship rows in both directions", () => {
    const helper = new FakeDataHelper();
    const incoming = helper.getIncomingFriendRequests({ pageSize: 10 });
    expect(incoming.length).toBeGreaterThan(0);

    helper.acceptFriendRequest(incoming[0].requestId);

    const friends = helper.getFriends({ pageSize: 50 });
    const friendIds = friends.map((f) => f.friendId);
    expect(friendIds).toContain("demo-user-4");
  });

  test("deleting a practice log cascades dependent media/comments/likes", () => {
    const helper = new FakeDataHelper();

    helper.likePracticeLog("practiceLog-102");
    helper.createPracticeLogComment("practiceLog-102", { text: "Nice!" });
    helper.createPracticeLogMedia("practiceLog-102", {
      type: "audio",
      url: "https://example.com/new-audio.mp3",
    });

    expect(helper.getPracticeLogLikes("practiceLog-102").length).toBeGreaterThan(0);
    expect(helper.getPracticeLogComments("practiceLog-102").length).toBeGreaterThan(0);
    expect(helper.getPracticeLogMedia("practiceLog-102").length).toBeGreaterThan(0);

    helper.deletePracticeLog("practiceLog-102");

    expect(() => helper.getPracticeLog("practiceLog-102")).toThrow("Practice log not found.");
    expect(() => helper.getPracticeLogLikes("practiceLog-102")).toThrow("Practice log not found.");
    expect(() => helper.getPracticeLogComments("practiceLog-102")).toThrow(
      "Practice log not found.",
    );
    expect(() => helper.getPracticeLogMedia("practiceLog-102")).toThrow(
      "Practice log not found.",
    );
  });

  test("likes/comments create notifications and read/delete operations work", () => {
    const helper = new FakeDataHelper();
    helper.likePracticeLog("practiceLog-102");
    helper.createPracticeLogComment("practiceLog-102", { text: "Great work" });

    helper.logout();
    helper.login({ email: "demo2@koda.example", password: "password123" });

    const notifications = helper.getNotifications();
    const created = notifications.filter((n) => n.entityId === "practiceLog-102");
    expect(created.length).toBeGreaterThanOrEqual(2);

    helper.markNotificationRead(created[0].notificationId);
    const refreshed = helper.getNotifications().find(
      (n) => n.notificationId === created[0].notificationId,
    );
    expect(refreshed?.isRead).toBe(true);

    helper.deleteNotification(created[0].notificationId);
    const afterDelete = helper.getNotifications();
    expect(afterDelete.some((n) => n.notificationId === created[0].notificationId)).toBe(false);
  });

  test("events are visible by month and can be updated by owner only", () => {
    const helper = new FakeDataHelper();

    const mine = helper.createEvent({
      title: "Scale Session",
      description: "Technique work",
      date: "2026-03-27",
      startTime: "09:00",
      endTime: "10:00",
      isAllDay: false,
      location: "Practice room",
      reminderMinBefore: 15,
      eventType: "practice",
      visibility: "friends",
    });

    const march = helper.getEventsForMonth("2026-03");
    expect(march.some((e) => e.eventId === mine.eventId)).toBe(true);

    const updated = helper.updateEvent(mine.eventId, { title: "Updated Scale Session" });
    expect(updated.title).toBe("Updated Scale Session");

    helper.logout();
    helper.login({ email: "demo2@koda.example", password: "password123" });
    expect(() => helper.updateEvent(mine.eventId, { title: "Nope" })).toThrow(
      "Not authorized to update this event.",
    );
  });
});
