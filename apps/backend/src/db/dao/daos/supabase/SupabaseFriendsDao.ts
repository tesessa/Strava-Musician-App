import { Friend } from "@strava-musician-app/shared";
import { FriendsDAO } from "../friendsDao";

export class SupabaseFriendsDao implements FriendsDAO {
  listFriends(
    userId: string,
    options?: { lastFriendId?: string | null; pageSize?: number },
  ): Promise<Friend[]> {
    throw new Error("Method not implemented.");
  }

  sendOrAcceptFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<{
    userId: string;
    friendId: string;
    accepted?: boolean;
    requestId?: string;
    requested?: boolean;
  }> {
    throw new Error("Method not implemented.");
  }

  removeFriend(userId: string, friendId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  isFriend(userId: string, otherUserId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
