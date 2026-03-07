/**
 * Shared enums for API and schema consistency.
 * Use these everywhere visibility, status, or type unions appear.
 */

export const VISIBILITY_VALUES = ["public", "private", "friends"] as const;
export type Visibility = (typeof VISIBILITY_VALUES)[number];

export const FRIEND_REQUEST_STATUS_VALUES = [
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as const;
export type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUS_VALUES)[number];

export const NOTIFICATION_TYPE_VALUES = [
  "like",
  "comment",
  "friendRequest",
  "challengeCompleted",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];

export const NOTIFICATION_ENTITY_TYPE_VALUES = [
  "session",
  "user",
  "challenge",
] as const;
export type NotificationEntityType =
  (typeof NOTIFICATION_ENTITY_TYPE_VALUES)[number];

export const EVENT_TYPE_VALUES = [
  "practice",
  "lesson",
  "performance",
] as const;
export type EventType = (typeof EVENT_TYPE_VALUES)[number];

export const MEDIA_TYPE_VALUES = ["audio", "video", "sheetMusic"] as const;
export type MediaType = (typeof MEDIA_TYPE_VALUES)[number];

export const CHALLENGE_TASK_VALUES = [
  "numPracticeSessions",
  "numAudioRecordings",
  "numVideoRecordings",
  "numFriends",
  "numHrsPracticed",
] as const;
export type ChallengeTask = (typeof CHALLENGE_TASK_VALUES)[number];
