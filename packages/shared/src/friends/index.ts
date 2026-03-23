/**
 * Single friendship row. Store two rows per friendship (A→B and B→A).
 */
export interface Friend {
  userId: string;
  friendId: string;
  friendsSince: string;
}

/**
 * GET /friends body (keyset pagination)
 */
export interface FriendsListRequest {
  /**
   * friendId of the last item in the previous page
   */
  lastItem?: string;
  pageSize?: number;
}

/**
 * GET /friends response
 */
export type FriendsListResponse = Friend[];
