import type { PublicUserProfile } from "../users";

/**
 * Single friendship row. Store two rows per friendship (A→B and B→A).
 */
export interface Friend {
  userId: string;
  friendId: string;
  friendsSince: string;
}

/**
 * GET /friends — friendship row plus the other user's public profile.
 */
export interface FriendWithUser extends Friend {
  friend: PublicUserProfile;
}

/**
 * GET /friends query (keyset pagination)
 */
export interface FriendsListRequest {
  /** friendId cursor from the previous page */
  lastFriendId?: string;
  pageSize?: number;
}

/**
 * GET /friends response
 */
export type FriendsListResponse = FriendWithUser[];
