import type { Friend, FriendRequest, User, FriendsListResponse } from "@strava-musician-app/shared";
import type { KodaServerApi } from "../network/KodaServerApi";

export interface FriendWithProfile {
  friendship: Friend;
  user: User | null;
}

// export interface PendingFriendRequestWithProfile {
//   request: FriendRequest;
//   user: User | null;
// }

/**
 * Friend-related business logic and data shaping.
 * Components should consume this service instead of calling server methods directly.
 */
export class FriendService {
  constructor(private readonly server: KodaServerApi) {}

  /** GET /friends (keyset pagination) 
   * do we need to make this separate getFriendsWtihProfiles
  */
  async getFriendsWithProfiles(pageSize = 100): Promise<FriendWithProfile[]> {
    const friends = await this.server.getFriends({ pageSize });
    const usersById = await this.loadUsersById(friends.map((friend) => friend.friendId));

    return friends.map((friendship) => ({
      friendship,
      user: usersById.get(friendship.friendId) ?? null,
    }));
  }

  async getFriends(lastFriendId?: string, pageSize?: number): Promise<FriendsListResponse> {
    return this.server.getFriends({ lastFriendId, pageSize });
  }

  /** DELETE /friends/:friendId */
  async unfriendSomeone(friendId: string): Promise<void> {
    await this.server.deleteFriend(friendId);
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
}
