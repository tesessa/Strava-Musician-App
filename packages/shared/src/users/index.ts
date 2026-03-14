import type { Visibility } from "../enums";
import type { PracticeLog } from "../practiceLogs";

/**
 * User profile (no password). postVisibility applies to all of this user's practice logs.
 * createdAt/updatedAt are ISO date strings (server-managed).
 */
export interface User {
  userId: string;
  email: string;
  username: string;
  profilePhoto?: string;
  bio?: string;
  postVisibility: Visibility;
  instruments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * PATCH /users/:userId body
 */
export interface UserUpdateRequest {
  username?: string;
  bio?: string;
  profilePhoto?: string;
  instruments?: string[];
  postVisibility?: Visibility;
}

/**
 * GET /users/search — slim variant for list results
 */
export interface UserSearchResult {
  userId: string;
  username: string;
  profilePhoto?: string;
  bio?: string;
}

/**
 * GET /users/:userId/practice-logs body (keyset pagination)
 */
export interface UserPracticeLogsRequest {
  /**
   * practiceLogId of the last item in the previous page
   */
  lastItem?: string;
  pageSize?: number;
}

/**
 * GET /users/:userId/practice-logs — list of practice logs for a user
 */
export type UserPracticeLogsResponse = PracticeLog[];
