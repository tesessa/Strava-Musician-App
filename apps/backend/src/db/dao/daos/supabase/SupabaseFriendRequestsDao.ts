import { FriendRequest } from "@strava-musician-app/shared";
import { FriendRequestsDAO } from "../friendRequestsDao";

export class SupabaseFriendRequestsDao implements FriendRequestsDAO {
  createFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest> {
    throw new Error("Method not implemented.");
  }

  getFriendRequestById(requestId: string): Promise<FriendRequest | null> {
    throw new Error("Method not implemented.");
  }

  listIncoming(
    userId: string,
    options?: { lastRequestId?: string; pageSize?: number },
  ): Promise<FriendRequest[]> {
    throw new Error("Method not implemented.");
  }

  listOutgoing(
    userId: string,
    options?: { lastRequestId?: string; pageSize?: number },
  ): Promise<FriendRequest[]> {
    throw new Error("Method not implemented.");
  }

  acceptRequest(requestId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  rejectRequest(requestId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  cancelRequest(requestId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
