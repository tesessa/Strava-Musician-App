import { FakeDataServer } from "../../../src/model/network/FakeDataServer";

describe("FakeDataServer contract behavior", () => {
  test("exposes functional auth + user endpoints", async () => {
    const server = new FakeDataServer();

    const me = await server.getMe();
    expect(me.userId).toBe("demo-user-1");

    const registered = await server.register({
      email: "serveruser@example.com",
      username: "serveruser",
      password: "pw123",
    });
    expect(registered.user?.username).toBe("serveruser");

    await server.logout();
    await expect(server.getMe()).rejects.toThrow("Not authenticated.");

    const login = await server.login({
      email: "serveruser@example.com",
      password: "pw123",
    });
    expect(login.token).toContain("fake-token");
  });

  test("exposes functional practice log/media/likes/comments endpoints", async () => {
    const server = new FakeDataServer();
    const created = await server.createPracticeLog({
      title: "Server Practice",
      durationMinutes: 25,
      postText: "Solid reps",
      instrument: "Piano",
    });
    expect(created.practiceLogId).toContain("practiceLog-");

    const media = await server.createPracticeLogMedia(created.practiceLogId, {
      type: "audio",
      url: "https://example.com/audio2.mp3",
    });
    expect(media.practiceLogId).toBe(created.practiceLogId);

    await server.likePracticeLog(created.practiceLogId);
    const likes = await server.getPracticeLogLikes(created.practiceLogId);
    expect(likes.some((l) => l.userId === "demo-user-1")).toBe(true);

    const comment = await server.createPracticeLogComment(created.practiceLogId, {
      text: "Nice work",
    });
    expect(comment.practiceLogId).toBe(created.practiceLogId);

    const comments = await server.getPracticeLogComments(created.practiceLogId);
    expect(comments.length).toBeGreaterThan(0);

    await server.deletePracticeLog(created.practiceLogId);
    await expect(server.getPracticeLog(created.practiceLogId)).rejects.toThrow(
      "Practice log not found.",
    );
  });

  test("exposes functional friends/request/challenges/events/notifications endpoints", async () => {
    const server = new FakeDataServer();
    const incoming = await server.getIncomingFriendRequests({ pageSize: 10 });
    expect(incoming.length).toBeGreaterThan(0);
    await server.acceptFriendRequest(incoming[0].requestId);

    const friends = await server.getFriends({ pageSize: 20 });
    expect(friends.some((f) => f.friendId === "demo-user-4")).toBe(true);

    const challenges = await server.getChallenges();
    expect(challenges.length).toBeGreaterThan(0);
    await server.completeChallenge(challenges[0].challengeId);
    const completed = await server.getCompletedChallenges("demo-user-1");
    expect(completed.some((c) => c.challengeId === challenges[0].challengeId)).toBe(true);

    const event = await server.createEvent({
      title: "Gig Prep",
      description: "Rehearsal",
      date: "2026-03-30",
      startTime: "20:00",
      endTime: "21:00",
      isAllDay: false,
      location: "Studio",
      reminderMinBefore: 30,
      eventType: "practice",
      visibility: "public",
    });
    const month = await server.getEventsForMonth("2026-03");
    expect(month.some((e) => e.eventId === event.eventId)).toBe(true);

    const notifications = await server.getNotifications();
    if (notifications.length > 0) {
      await server.markNotificationRead(notifications[0].notificationId);
      await server.deleteNotification(notifications[0].notificationId);
    }
  });
});
