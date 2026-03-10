import type { Visibility } from "../enums";
import type { PracticeSession } from "../sessions";

/**
 * User profile (no password). postVisibility applies to all of this user's practice sessions.
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
 * GET /users/:userId/sessions — list of practice sessions for a user
 */
export type UserSessionsResponse = PracticeSession[];
