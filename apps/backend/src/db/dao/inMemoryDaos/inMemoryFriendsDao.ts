import { FriendsDAO } from "../daos/friendsDao";
import { inMemorySocialState } from "./inMemorySocialState";
import type { Friend } from "@strava-musician-app/shared";

function generateId() {
  return Math.random().toString(36).slice(2);
}

export function createInMemoryFriendsDAO(): FriendsDAO {
  const { friendships, friendRequests } = inMemorySocialState;
  return {
    async listFriends(userId, options = {}): Promise<Friend[]> {
      const { lastFriendId = null, pageSize = 20 } = options;
      // Sort by friendsSince for stable pagination
      const userFriends = friendships
        .filter(f => f.userId === userId)
        .sort((a, b) => a.friendsSince.localeCompare(b.friendsSince));
      let startIdx = 0;
      if (lastFriendId) {
        const idx = userFriends.findIndex(f => f.friendId === lastFriendId);
        if (idx === -1) return [];
        startIdx = idx + 1;
      }
      return userFriends.slice(startIdx, startIdx + pageSize);
    },
    async sendOrAcceptFriendRequest(userId, friendId) {
      // Check for a pending friend request from friendId to userId
      const pendingReq = friendRequests.find(r => r.senderId === friendId && r.receiverId === userId && r.status === 'pending');
      if (pendingReq) {
        // Accept the request and create friendship both ways
        pendingReq.status = 'accepted';
        pendingReq.respondedAt = new Date().toISOString();
        const now = new Date().toISOString();
        if (!friendships.some(f => f.userId === userId && f.friendId === friendId)) {
          friendships.push({ userId, friendId, friendsSince: now });
        }
        if (!friendships.some(f => f.userId === friendId && f.friendId === userId)) {
          friendships.push({ userId: friendId, friendId: userId, friendsSince: now });
        }
        return { userId, friendId, accepted: true };
      }
      // If no pending request, check if a request already exists from userId to friendId
      let existingReq = friendRequests.find(r => r.senderId === userId && r.receiverId === friendId && r.status === 'pending');
      if (!existingReq) {
        // Create a new friend request
        existingReq = {
          requestId: generateId(),
          senderId: userId,
          receiverId: friendId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        friendRequests.push(existingReq);
      }
      return { userId, friendId, requestId: existingReq.requestId, requested: true };
    },
    async removeFriend(userId, friendId) {
      for (const [a, b] of [[userId, friendId], [friendId, userId]]) {
        const idx = friendships.findIndex(f => f.userId === a && f.friendId === b);
        if (idx !== -1) friendships.splice(idx, 1);
      }
    },
    async isFriend(userId, otherUserId) {
      return friendships.some(f => f.userId === userId && f.friendId === otherUserId);
    },
  };
}
