import type { FriendRequest } from "@strava-musician-app/shared";

export interface FriendRequestsDAO {
  createFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest>;
  getFriendRequestById(requestId: string): Promise<FriendRequest | null>;
  listIncoming(userId: string, options?: { lastRequestId?: string, pageSize?: number }): Promise<FriendRequest[]>;
  listOutgoing(userId: string, options?: { lastRequestId?: string, pageSize?: number }): Promise<FriendRequest[]>;
  acceptRequest(requestId: string): Promise<void>;
  rejectRequest(requestId: string): Promise<void>;
  cancelRequest(requestId: string): Promise<void>;
}
