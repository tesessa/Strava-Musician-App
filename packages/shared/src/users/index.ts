import type { Visibility } from "../enums";

/**
 * Public profile fields returned for any user (e.g. friends, feed authors).
 * Email is never included — use {@link User} for the authenticated account with email.
 */
export interface PublicUserProfile {
  userId: string;
  username: string;
  profilePhoto?: string;
  bio?: string;
  postVisibility: Visibility;
  instruments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Full account profile (no password). Includes email for the signed-in user only.
 * postVisibility applies to all of this user's practice logs.
 */
export interface User extends PublicUserProfile {
  email: string;
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

