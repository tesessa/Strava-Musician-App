/**
 * Single friendship row. Store two rows per friendship (A→B and B→A).
 */
export interface Friend {
  userId: string;
  friendId: string;
  friendsSince: string;
}

/**
 * GET /friends response
 */
export type FriendsListResponse = Friend[];
