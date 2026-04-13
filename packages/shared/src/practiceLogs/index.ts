import type { PublicUserProfile } from "../users";

/**
 * Practice log. Visibility is determined by the log owner's User.postVisibility only.
 */
export interface PracticeLog {
  userId: string;
  practiceLogId: string;
  title: string;
  postText?: string;
  privateText?: string;
  instrument?: string;
  createdAt: string;
  durationMinutes: number;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}

/**
 * POST /practice-logs body.
 */
export interface CreatePracticeLogRequest {
  title: string;
  postText?: string;
  privateText?: string;
  instrument?: string;
  durationMinutes: number;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}

/**
 * PATCH /practice-logs/:practiceLogId
 */
export type UpdatePracticeLogRequest = Partial<CreatePracticeLogRequest>;

/**
 * GET /practice-logs/feed query (keyset pagination). Cursor is the last practiceLogId from the previous page.
 */
export interface FeedRequest {
  lastItemId?: string;
  pageSize?: number;
}

/**
 * Practice log with author profile (feed, user timeline, single log GET).
 */
export interface PracticeLogWithAuthor extends PracticeLog {
  author: PublicUserProfile;
}

/**
 * GET /practice-logs/feed response
 */
export type FeedResponse = PracticeLogWithAuthor[];

/**
 * GET /users/:userId/practice-logs query (keyset pagination)
 */
export interface UserPracticeLogsRequest {
  /** practiceLogId cursor from the previous page */
  lastItemId?: string;
  pageSize?: number;
}

/**
 * GET /users/:userId/practice-logs — practice logs with author (same shape as feed)
 */
export type UserPracticeLogsResponse = PracticeLogWithAuthor[];
