import type { FriendRequestStatus } from "../enums";
import type { PublicUserProfile } from "../users";

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
 * Incoming request with sender profile
 */
export interface FriendRequestWithSender extends FriendRequest {
  sender: PublicUserProfile;
}

/**
 * Outgoing request with receiver profile
 */
export interface FriendRequestWithReceiver extends FriendRequest {
  receiver: PublicUserProfile;
}

/**
 * GET /friend-requests/incoming response
 */
export type IncomingFriendRequestsResponse = FriendRequestWithSender[];

/**
 * GET /friend-requests/outgoing response
 */
export type OutgoingFriendRequestsResponse = FriendRequestWithReceiver[];
