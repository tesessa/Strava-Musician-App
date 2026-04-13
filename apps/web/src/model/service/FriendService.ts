import type { Friend, FriendRequest, User } from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network/KodaServerApi";

export interface FriendWithProfile {
  friendship: Friend;
  user: User | null;
}

export interface PendingFriendRequestWithProfile {
  request: FriendRequest;
  user: User | null;
}

/**
 * Friend-related business logic and data shaping.
 * Components should consume this service instead of calling server methods directly.
 */
export class FriendService {
  constructor(private readonly server: KodaServerApi) {}

  async getFriendsWithProfiles(pageSize = 100): Promise<FriendWithProfile[]> {
    const friends = await this.server.getFriends({ pageSize });
    const usersById = await this.loadUsersById(friends.map((friend) => friend.friendId));

    return friends.map((friendship) => ({
      friendship,
      user: usersById.get(friendship.friendId) ?? null,
    }));
  }

  async getIncomingFriendRequestsWithProfiles(
    pageSize = 25,
  ): Promise<PendingFriendRequestWithProfile[]> {
    const requests = await this.server.getIncomingFriendRequests({ pageSize });
    console.log("Loaded incoming friend requests:", requests);
    const usersById = await this.loadUsersById(
      requests.map((request) => request.senderId),
    );
    console.log("Loaded users for incoming friend requests:", usersById);
    return requests.map((request) => ({
      request,
      user: usersById.get(request.senderId) ?? null,
    }));
  }

  async getOutgoingFriendRequestsWithProfiles(
    pageSize = 25,
  ): Promise<PendingFriendRequestWithProfile[]> {
    const requests = await this.server.getOutgoingFriendRequests({ pageSize });
    const usersById = await this.loadUsersById(
      requests.map((request) => request.receiverId),
    );
    return requests.map((request) => ({
      request,
      user: usersById.get(request.receiverId) ?? null,
    }));
  }

  /**
   * Removes a pending incoming request from the current user's queue.
   * Backend operation is delete, while UI language uses cancel.
   */
  async cancelPendingFriendRequest(requestId: string): Promise<void> {
    await this.server.cancelFriendRequest(requestId);
  }

  private async loadUsersById(userIds: string[]): Promise<Map<string, User>> {
    const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
    const resolved = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const user = await this.server.getUser(userId);
          return [userId, user] as const;
        } catch {
          return null;
        }
      }),
    );

    return new Map(
      resolved.filter((entry): entry is readonly [string, User] => entry !== null),
    );
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await this.server.acceptFriendRequest(requestId);
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await this.server.rejectFriendRequest(requestId);
  }
}
