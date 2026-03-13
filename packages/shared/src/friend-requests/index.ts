import type { FriendRequestStatus } from "../enums";

/**
 * Friend request record
 */
export interface FriendRequest {
  requestId: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

/**
 * GET /friend-requests/incoming and /friend-requests/outgoing body (keyset pagination)
 */
export interface FriendRequestsPageRequest {
  /**
   * requestId of the last item in the previous page
   */
  lastItem?: string;
  pageSize?: number;
}

/**
 * GET /friend-requests/incoming response
 */
export type IncomingFriendRequestsResponse = FriendRequest[];

/**
 * GET /friend-requests/outgoing response
 */
export type OutgoingFriendRequestsResponse = FriendRequest[];
