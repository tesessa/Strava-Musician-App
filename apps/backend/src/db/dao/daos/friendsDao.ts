import type { Friend } from "@strava-musician-app/shared";

export interface FriendsDAO {
  listFriends(userId: string, options?: { lastFriendId?: string | null, pageSize?: number }): Promise<Friend[]>;
  sendOrAcceptFriendRequest(userId: string, friendId: string): Promise<{ userId: string; friendId: string; accepted?: boolean; requestId?: string; requested?: boolean }>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  isFriend(userId: string, otherUserId: string): Promise<boolean>;
}
