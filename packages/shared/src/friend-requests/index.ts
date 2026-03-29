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
 * GET /friend-requests/incoming and /friend-requests/outgoing query (keyset pagination)
 */
export interface FriendRequestsPageRequest {
  /** requestId cursor from the previous page */
  lastRequestId?: string;
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
