import type {
  Friend,
  FriendRequest,
  FriendRequestWithReceiver,
  FriendRequestWithSender,
  FriendWithUser,
  PublicUserProfile,
} from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network/KodaServerApi";

export interface FriendWithProfile {
  friendship: Friend;
  user: PublicUserProfile | null;
}

export interface PendingFriendRequestWithProfile {
  request: FriendRequest;
  user: PublicUserProfile | null;
}

/**
 * Friend-related business logic and data shaping.
 * Components should consume this service instead of calling server methods directly.
 */
export class FriendService {
  constructor(private readonly server: KodaServerApi) {}

  async getFriendsWithProfiles(pageSize = 100): Promise<FriendWithProfile[]> {
    const friends = await this.server.getFriends({ pageSize });
    return (friends as FriendWithUser[]).map((row) => ({
      friendship: {
        userId: row.userId,
        friendId: row.friendId,
        friendsSince: row.friendsSince,
      },
      user: row.friend,
    }));
  }

  async getIncomingFriendRequestsWithProfiles(
    pageSize = 25,
  ): Promise<PendingFriendRequestWithProfile[]> {
    const rows = await this.server.getIncomingFriendRequests({ pageSize });
    return (rows as FriendRequestWithSender[]).map((row) => {
      const { sender: _s, ...request } = row;
      return {
        request,
        user: row.sender,
      };
    });
  }

  async getOutgoingFriendRequestsWithProfiles(
    pageSize = 25,
  ): Promise<PendingFriendRequestWithProfile[]> {
    const rows = await this.server.getOutgoingFriendRequests({ pageSize });
    return (rows as FriendRequestWithReceiver[]).map((row) => {
      const { receiver: _r, ...request } = row;
      return {
        request,
        user: row.receiver,
      };
    });
  }

  /**
   * Removes a pending incoming request from the current user's queue.
   * Backend operation is delete, while UI language uses cancel.
   */
  async cancelPendingFriendRequest(requestId: string): Promise<void> {
    await this.server.cancelFriendRequest(requestId);
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await this.server.acceptFriendRequest(requestId);
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await this.server.rejectFriendRequest(requestId);
  }
}
