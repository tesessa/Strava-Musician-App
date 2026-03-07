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
 * GET /friend-requests/incoming response
 */
export type IncomingFriendRequestsResponse = FriendRequest[];

/**
 * GET /friend-requests/outgoing response
 */
export type OutgoingFriendRequestsResponse = FriendRequest[];
